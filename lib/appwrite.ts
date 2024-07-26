import { Account, AppwriteException, Client, Databases, ID, Query } from 'react-native-appwrite';
import Constants from 'expo-constants';

const { endpoint = "", platform = "", projectId = "", storageId = "", databaseId = "", userCollectionId = "", deerCollectionId = "" } = Constants.expoConfig?.extra || {};

export enum Collection {
    user = "user",
    deer = "deer"
}

function GetCollectionId(collection: Collection): string {
    switch (collection) {
        case Collection.user:
            return userCollectionId;
        case Collection.deer:
            return deerCollectionId;
    }
}


// Init your React Native SDK
const client = new Client();
const databases = new Databases(client);

client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setPlatform(platform);

const account = new Account(client);


// Register user
export async function createUser(email: string, password: string, username: string) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        await signIn(email, password);

        const data = {
            accountId: newAccount.$id,
            email: email,
            username: username
        }

        const newUser = createAppWrite(data, Collection.user);

        return newUser;
    } catch (error: any) {
        throw new Error(error);
    }
}

// Sign In
export async function signIn(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error: any) {
        throw new Error(error);
    }
}

// Get Account
export async function getAccount() {
    try {
        const currentAccount = await account.get();

        return currentAccount;
    } catch (error: any) {
        throw new Error(error);
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            databaseId,
            GetCollectionId(Collection.user),
            [Query.equal("accountId", currentAccount.$id)]
        );

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        // .log(error);
        return null;
    }
}

// Sign Out
export async function signOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error: any) {
        throw new Error(error);
    }
}


// Create Document
export async function createAppWrite(form: Object, collection: Collection) {
    try {

        // const documentData: { [key: string]: any } = {};

        // // Iterate over the form object and add keys and values to documentData
        // Object.entries(form).forEach(([key, value]) => {
        //     documentData[key] = value;
        // });
        const document = await databases.createDocument(
            databaseId,
            GetCollectionId(collection),
            ID.unique(),
            form

        );
        return document;
    } catch (error: any) {
        throw new Error(error);
    }
}

// Update Document
export async function updateAppWrite(documentId: string, form: Object, collection: Collection) {
    try {
        const document = await databases.updateDocument(
            databaseId,
            GetCollectionId(collection),
            documentId,
            form
        );

        return document;
    } catch (error: any) {
        throw new Error(error);
    }
}

// Delete Document
export async function deleteAppWrite(documentId: string, collection: Collection) {
    try {
        await databases.deleteDocument(
            databaseId,
            GetCollectionId(collection),
            documentId
        );
    } catch (error: any) {
        throw new Error(error);
    }
}


export async function getDocumentByIdAppWrite(documentId: string, collection: Collection) {
    try {
        const document = await databases.getDocument(
            databaseId,
            GetCollectionId(collection),
            documentId
        );
        return document;
    } catch (error: any) {
        throw new Error(error);
    }
}

export async function getDocumentsByUserIdAppWrite(userId: string, collection: Collection) {
    try {
        // const filters = [
        //     `userId=${userId}`
        // ];

        const documents = await databases.listDocuments(
            databaseId,
            GetCollectionId(collection),
            [Query.equal("userId", userId)]
        );

        return documents.documents;
    } catch (error: any) {
        throw new Error(error);
    }
}
