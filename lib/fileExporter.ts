import { jsonToCSV, readRemoteFile } from 'react-native-csv';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Deer } from '@/objects/deerObjects';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

export async function exportDeerCSV(deerList: Deer[]) {

    const CSV = jsonToCSV(deerList);

    // Name the File
    const fileName = `DeerData.csv`;

    const directoryUri = FileSystem.documentDirectory;
    const fileUri = directoryUri + fileName;

    try {
        await FileSystem.writeAsStringAsync(fileUri, CSV);
        shareAsync(fileUri);
    } catch (error) {
        console.log("Error creating file" + error);
    }

}

function csvToArray(csv: string) {
    const rows = csv.split('\n');
    return rows.map(row => row.split(','));
}

export async function exportDeerPDF(deerList: Deer[]) {
    // Convert JSON data to CSV
    const CSV = jsonToCSV(deerList);
    const csvArray = csvToArray(CSV);

    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' stands for landscape

    autoTable(doc, {
        head: [csvArray[0]], // Header row
        body: csvArray.slice(1) // Body rows
    });

    const arraybuffer = doc.output('arraybuffer');
    const pdfBase64 = arrayBufferToBase64(arraybuffer);

    // Save the PDF to file system
    const fileName = `DeerData.pdf`;
    const directoryUri = FileSystem.documentDirectory;
    const fileUri = directoryUri + fileName;

    try {
        await FileSystem.writeAsStringAsync(fileUri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });
        // Share the PDF
        await shareAsync(fileUri);
    } catch (error) {
        console.log("Error creating file" + error);
    }
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return globalThis.btoa(binary); // Using globalThis.btoa for cross-environment compatibility
}


// const save = async (uri: string, filename: string, mimetype: string) => {
//     if (Platform.OS === "android") {
//         const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
//         if (permissions.granted) {
//             const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
//             await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, mimetype)
//                 .then(async (uri) => {
//                     await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
//                 })
//                 .catch(e => console.log(e));
//         } else {
//             shareAsync(uri);
//         }
//     } else {
//         shareAsync(uri);
//     }
// };