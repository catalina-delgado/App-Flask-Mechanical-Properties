window.onload = function() {
    cargarDatos('/api/products');
};

function cargarDatos(route) {

    fetch(route)
    .then(response => response.json())
    .then(products => {
        const productContainer = document.getElementsByClassName('comparison-table');
        console.log('products')
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <h2>${product.name}</h2>
                <img src="https://via.placeholder.com/150" alt="${product.name}">
                <ul>
                    <li>${product.description}</li>
                    <li>Precio: $${product.price.toFixed(2)}</li>
                    <li>Fecha de entrega: ${product.entrega}</li>
                </ul>
            `;
            productContainer[0].appendChild(productDiv);
        });
    })
    .catch(error => console.error('Error fetching products:', error));
 
}

const suggestions = [
    "Resultado 1",
    "Resultado 2",
    "Resultado 3",
    "Sugerencia 1",
    "Sugerencia 2",
    "Sugerencia 3",
];

function showSuggestions() {
    console.log('oninput')
    const query = document.getElementById('searchInput').value.toLowerCase();
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = ''; // Limpiar sugerencias previas

    if (query.trim() === '') {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const filteredSuggestions = suggestions.filter(suggestion => suggestion.toLowerCase().includes(query));
    if (filteredSuggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    filteredSuggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = suggestion;
        suggestionItem.onclick = () => selectSuggestion(suggestion);
        suggestionsContainer.appendChild(suggestionItem);
    });

    suggestionsContainer.style.display = 'block';
}

function selectSuggestion(suggestion) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = suggestion;
    document.getElementById('suggestions').style.display = 'none';
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
        document.getElementById('suggestions').style.display = 'none';
    }
});