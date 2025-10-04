const searchInput = document.getElementById('searchInput');
const results = document.getElementById('results');

searchInput.addEventListener('input', (e) => {
  const query = e.target.value;

  fetch(`/api/search?query=${query}`)
    .then(response => response.json())
    .then(data => {
      // Clear previous results
      results.innerHTML = '';

      // Display new results
      data.forEach(result => {
        const div = document.createElement('div');
        div.innerHTML = `
          <h3>${result.name}</h3>
          <p>ID: ${result.id}</p>
        `;
        results.appendChild(div);
      });
    });
});
