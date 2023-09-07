document.addEventListener('DOMContentLoaded', (event) => {
    console.log("Script loaded");
    const analyze_btn = document.getElementById('analyzeButton');
    const cards = document.getElementById('cards');
    const ENDPOINT = 'http://127.0.0.1:5000/analyze';

    const fetchData = () => {
        let data = {url: 'https://edition.cnn.com/2023/09/07/europe/european-energy-security-russia-ukraine-china-cmd-intl/index.html'};

        fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    analyze_btn.addEventListener('click', () => {
        analyze_btn.style.display = 'none';
        cards.style.display = 'block';
        // Call your fetchData function here
        fetchData();
    });
});