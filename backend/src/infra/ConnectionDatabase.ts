import { MongoClient } from 'mongodb';

const username = "root";
const password = "admin";
const host = "localhost"; // ou o endereço do seu servidor MongoDB
const port = 27017;       // porta padrão do MongoDB
const dbName = "tags";    // Nome do banco de dados

// URI de conexão com autenticação
const uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`;

const client = new MongoClient(uri);

export async function connectToDatabase() {
    try {
        // Conectar ao cliente MongoDB
        await client.connect();

        console.log("Conectado ao MongoDB!");

        // Selecionar o banco de dados
        const db = client.db(dbName);

        return db;
    } catch (err) {
        console.error("Erro ao conectar ao MongoDB", err);
        throw err;
    }
}

export default connectToDatabase;
