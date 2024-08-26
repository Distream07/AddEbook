const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// URI MongoDB
const mongoURI = 'mongodb+srv://distream07:97hnVf1LgK2JZOl4@cluster0.bn3vv.mongodb.net/Collection?retryWrites=true&w=majority&appName=Cluster0';

// Crée un client MongoDB avec des options de version stable de l'API
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour permettre les requêtes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Middleware pour définir la CSP
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-src 'self' https://e-player-stream.app;");
  next();
});

// Fonction pour connecter MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB :", error);
    throw error;
  }
}

// Route pour ajouter des images
app.post('/add-images', async (req, res) => {
  try {
    await connectToMongo();
    const db = client.db('Collection');
    const collection = db.collection('AllScan');

    // Assure-toi que `images` est un tableau, que `galleryName` et `description` sont des chaînes de caractères
    const { images, galleryName, description } = req.body;

    if (!Array.isArray(images) || typeof galleryName !== 'string' || typeof description !== 'string') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Préparer le document pour l'insertion
    const document = {
      Name: galleryName,
      Description: description,  // Ajout de la description
      ...images.reduce((acc, url, index) => {
        acc[`image${index + 1}`] = url.trim();
        return acc;
      }, {})
    };

    // Insérer le document dans la collection
    const result = await collection.insertOne(document);
    res.json({ message: 'Images added successfully!', data: result });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des images:', error);
    res.status(500).json({ error: 'Échec de l\'ajout des images' });
  } finally {
    await client.close();
  }
});


// Route pour servir viewVideo.html
app.get('/html/viewVideo.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'viewVideo.html'));
});

// Écoute du serveur sur le port défini
app.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});
