import { jsonToCSV, readRemoteFile } from 'react-native-csv';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { timeOnlyToStringPrint, Deer, deerDisplayName, deerPrint } from '@/objects/deerObjects';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

const exportTableColumns = ["dateTime", "timeOnly", "place", "destination", "species", "weight", "age", "sex", "embryo", "milk", "comments"];

function toPrintDeer(deer: any): Record<string, any> {
    const newPrintDeer: Record<string, any> = {};

    exportTableColumns.forEach(column => {

        if (column == "timeOnly") {
            newPrintDeer["Time"] = timeOnlyToStringPrint(deer["dateTime"]);
        }
        else {
            newPrintDeer[deerDisplayName(column)] = deerPrint(column, deer[column]);
        }

    });

    return newPrintDeer;
}

function toPrintDeerList(deerList: Deer[]): Record<string, any>[] {
    return deerList.map(deer => toPrintDeer(deer));
}

export async function exportDeerCSV(deerList: Deer[]) {

    const printDeerList = toPrintDeerList(deerList);

    // printDeerList.forEach(deer => {
    //    
    // });

    const CSV = jsonToCSV(printDeerList);

    // Name the File
    const fileName = `DeerData.csv`;

    const directoryUri = FileSystem.documentDirectory;
    const fileUri = directoryUri + fileName;

    try {
        await FileSystem.writeAsStringAsync(fileUri, CSV);
        shareAsync(fileUri);
    } catch (error) {
        console.error("Error creating file" + error);
    }

}

function csvToArray(csv: string) {
    const rows = csv.split('\n');
    return rows.map(row => row.split(','));
}

export async function exportDeerPDF(deerList: Deer[]) {

    const printDeerList = toPrintDeerList(deerList);
    const CSV = jsonToCSV(printDeerList);
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
        console.error("Error creating file" + error);
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
