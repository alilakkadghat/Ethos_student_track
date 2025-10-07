require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fuzzy = require('fuzzy');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const app = express();


const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
console.log('Firebase connected successfully.');


const profilesRef = db.collection('profiles');
const logsRef = db.collection('logs');
const timelinesRef = db.collection('timelines');
const alertsRef = db.collection('alerts');
const cardSwipeRef = db.collection('card_swipe');
const cctvFrameRef = db.collection('cctv_frame');
const labBookingRef = db.collection('lab_booking');
const labCheckoutRef = db.collection('lab_checkout');
const wifiLogRef = db.collection('wifi_log');

const uploadData = async (ref, data) => {
    const batch = db.batch();
    data.forEach((item) => {
        const docRef = ref.doc();
        batch.set(docRef, item);
    });
    await batch.commit();
};

const importData = async () => {
    try {
        const cardSwipeData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'card_swipe.json'), 'utf8'));
        const cctvFrameData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cctv_frame.json'), 'utf8'));
        const labBookingData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lab_booking.json'), 'utf8'));
        const labCheckoutData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lab_checkout.json'), 'utf8'));
        const profileData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'profile.json'), 'utf8'));
    const wifiLogData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'wifi_log.json'), 'utf8'));

        await uploadData(cardSwipeRef, cardSwipeData);
        await uploadData(cctvFrameRef, cctvFrameData);
        await uploadData(labBookingRef, labBookingData);
        await uploadData(labCheckoutRef, labCheckoutData);
        await uploadData(profilesRef, profileData);
        await uploadData(wifiLogRef, wifiLogData);

        console.log('All data imported successfully.');
    } catch (error) {
        console.error('Error importing data:', error);
    }
};

importData();


const createLogAndResolveEntity = async (req, res) => {
    try {
        const { entity_id, name, source, activity, location } = req.body;
        
        
        const timestamp = new Date();
        const newLog = { entity_id, name, source, activity, location, timestamp };
        await logsRef.add(newLog);

        let profile = null;

        
        if (entity_id) {
            const queryFields = ['card_id', 'device_hash', 'face_id', 'student_id'];
            for (const field of queryFields) {
                const snapshot = await profilesRef.where(field, '==', entity_id).limit(1).get();
                if (!snapshot.empty) {
                    profile = snapshot.docs[0].data();
                    break; 
                }
            }
        }
        
       
        if (!profile && name) {
            console.log(`Exact match failed for ID: '${entity_id}'. Attempting fuzzy match for name: "${name}"`);
            
            const allProfilesSnapshot = await profilesRef.select('student_id', 'name').get();
            if (!allProfilesSnapshot.empty) {
                const allProfiles = allProfilesSnapshot.docs.map(doc => doc.data());
                const profileNames = allProfiles.map(p => p.name);
                const results = fuzzy.filter(name, profileNames);

                const FUZZY_SCORE_THRESHOLD = 8; 
                if (results.length > 0 && results[0].score > FUZZY_SCORE_THRESHOLD) {
                    const bestMatchName = results[0].string;
                    console.log(`Fuzzy match found: "${name}" -> "${bestMatchName}" with score ${results[0].score}`);
                    const matchedProfileData = allProfiles.find(p => p.name === bestMatchName);
                    profile = matchedProfileData; 
                } else {
                     console.log(`Fuzzy match for "${name}" did not meet the confidence threshold.`);
                }
            }
        }
        
       
        if (!profile) {
            return res.status(202).json({ 
                message: "Log created, but could not resolve entity with provided identifiers.",
                log: newLog
            });
        }

        
        const studentId = profile.student_id;
        const formattedTime = timestamp.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
        const eventMessage = `${profile.name} performed '${activity}' at ${location} at ${formattedTime}.`;
        
        const newActivity = { message: eventMessage, location, timestamp };
        
        const timelineDocRef = timelinesRef.doc(studentId);
        
       
        await timelineDocRef.set({
            student_id: studentId,
           
            activities: admin.firestore.FieldValue.arrayUnion(newActivity),
            
            lastActivityTimestamp: timestamp
        }, { merge: true });
        
        res.status(201).json({ message: "Log created and timeline updated successfully.", student_id: studentId });

    } catch (error) {
        console.error("Error in entity resolution:", error);
        res.status(500).json({ error: "Server error during entity resolution." });
    }
};

/**
 * Controller to fetch a timeline by student ID.
 */
const getTimelineByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const timelineDoc = await timelinesRef.doc(studentId).get();
        if (!timelineDoc.exists) {
            return res.status(404).json({ message: "No timeline found for this student ID." });
        }
        
       
        const timelineData = timelineDoc.data();
        timelineData.activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        
        res.status(200).json(timelineData);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching timeline." });
    }
};

/**
 * Controller to fetch all active (new) alerts.
 */
const getActiveAlerts = async (req, res) => {
    try {
        const snapshot = await alertsRef.where('status', '==', 'new').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        const alerts = snapshot.docs.map(doc => doc.data());
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching alerts." });
    }
};

const checkInactiveEntities = async () => {
    try {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        

        const snapshot = await timelinesRef.where('lastActivityTimestamp', '<', twelveHoursAgo).get();

        if (snapshot.empty) {
            console.log("Cron job finished: No inactive entities found.");
            return;
        }

        for (const doc of snapshot.docs) {
            const timeline = doc.data();
            
            const alertSnapshot = await alertsRef
                .where('student_id', '==', timeline.student_id)
                .where('status', '==', 'new')
                .limit(1).get();

            if (alertSnapshot.empty) {
                const message = `Entity ${timeline.student_id} not seen in the past 12 hours.`;
                await alertsRef.add({
                    student_id: timeline.student_id,
                    message,
                    status: 'new',
                    timestamp: new Date()
                });
                console.log(`ALERT CREATED for inactive entity: ${timeline.student_id}`);
            }
        }
    } catch (error) {
        console.error("Error during cron job for inactive entities:", error);
    }
};


app.post('/api/logs', createLogAndResolveEntity);
app.get('/api/timelines/:studentId', getTimelineByStudentId);
app.get('/api/alerts', getActiveAlerts);

app.get('/', (req, res) => {
    res.send('Campus Security Backend with Firebase is running.');
});

cron.schedule('0 * * * *', () => {
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`[${now}] Running cron job: Checking for inactive entities...`);
    checkInactiveEntities();
});


app.listen(PORT, () => {
    console.log(`Using PORT=${PORT}`);
    console.log(`Server is listening on http://localhost:${PORT}`);
});

module.exports = { importData };
