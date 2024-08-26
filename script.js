document.getElementById('imageForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const imagesText = document.getElementById('images').value;
    const galleryName = document.getElementById('galleryName').value;
    const description = document.getElementById('description').value;

    // Séparer les URLs par les sauts de ligne et supprimer les espaces superflus
    const images = imagesText.split('\n').map(url => url.trim()).filter(url => url.length > 0);

    try {
        const response = await fetch('http://localhost:3000/add-images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ images, galleryName, description })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        console.log('Images added:', data);
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
});
