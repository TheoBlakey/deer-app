import { Models } from "react-native-appwrite";

export enum Species {
    Red = "Red",
    Sika = "Sika",
    Fallow = "Fallow",
    Roe = "Roe",
    Muntjac = "Muntjac"
}

export enum Sex {
    Male = "Male",
    Female = "Female"
}

export enum Destination {
    Butcher = "Butcher",
    Abattoir = "Abattoir",
    Restaurant = "Restaurant"
}

export interface Place {
    $id: string
    // userId?: string | null
    name: string | null
}

export interface Deer {
    userId?: string | null
    dateTime: Date;
    species: Species | null;
    weight: number | null;
    age: number | null;
    sex: Sex | null;
    embryo: boolean | null;
    milk: boolean | null;
    place: Place | null;
    destination: Destination | null;
    comments: string;
}


export function createDefaultDeer(): Deer {
    return {
        userId: null,
        dateTime: new Date(),  // Current date and time
        species: null,
        sex: null,
        age: null,
        weight: null,
        embryo: null,
        milk: null,
        place: null,
        destination: null,
        comments: ""
    };
}


export function mapToDeerList(documents: Models.Document[]): Deer[] {
    return documents.map(mapToDeer);
}

export function mapToDeer(document: Models.Document): Deer {

    const newDeer: Deer = {
        // userId: document.userId ? document.userId.$id : null,
        dateTime: document.dateTime ? new Date(document.dateTime) : new Date(),
        species: document.species as Species | null,
        weight: document.weight !== undefined ? document.weight : null,
        age: document.age !== undefined ? document.age : null,
        sex: document.sex as Sex | null,
        embryo: document.embryo !== undefined ? document.embryo : null,
        milk: document.milk !== undefined ? document.milk : null,
        place: document.place !== undefined && document.place !== null ? document.place : null,
        destination: document.destination as Destination | null,
        comments: document.comments || '',
    };

    return newDeer;
}

const deerObjectConstants = [
    { PropName: "dateTime", DisplayName: "Date", printFunction: dateOnlyToStringPrint },
    { PropName: "place", DisplayName: "Place", printFunction: placeToStringPrint },
    { PropName: "destination", DisplayName: "Destination", printFunction: toStringPrint },
    { PropName: "species", DisplayName: "Species", printFunction: toStringPrint },
    { PropName: "weight", DisplayName: "Weight", printFunction: toStringPrint },
    { PropName: "age", DisplayName: "Age", printFunction: toStringPrint },
    { PropName: "sex", DisplayName: "Sex", printFunction: toStringPrint },
    { PropName: "embryo", DisplayName: "Embryo", printFunction: boolToStringPrint },
    { PropName: "milk", DisplayName: "Milk", printFunction: boolToStringPrint },
    { PropName: "comments", DisplayName: "Comments", printFunction: toStringPrint },
];

export function deerPrint(propName: string, input: any): string {

    const item = deerObjectConstants.find(obj => obj.PropName === propName);
    return item ? item.printFunction(input) : "";
}

export function deerDisplayName(propName: string): string {

    const item = deerObjectConstants.find(obj => obj.PropName === propName);
    return item ? item.DisplayName : "";
}


function toStringPrint(field: any): string {
    if (field === null || field === undefined) {
        return ""
    }
    return field.toString();
}

function boolToStringPrint(field: Boolean): string {
    if (field === null || field === undefined) {
        return "N/A"
    }
    return field ? "Yes" : "No";
}

function placeToStringPrint(field: Place): string {
    if (field === null || field === undefined || field.name === null || field.name === undefined) {
        return ""
    }
    return field.name
}

export function dateOnlyToStringPrint(field: Date): string {

    if (!(field instanceof Date)) {
        field = new Date(field);
    }

    const day = field.getDate().toString().padStart(2, '0');
    const month = (field.getMonth() + 1).toString().padStart(2, '0');
    const year = field.getFullYear().toString().slice(-2); // Get last 2 digits of the year
    return `${day}/${month}/${year}`;
}

// export function dateAndTimeToStringPrint(field: Date): string {
//     const day = field.getDate().toString().padStart(2, '0');
//     const month = (field.getMonth() + 1).toString().padStart(2, '0');
//     const year = field.getFullYear().toString().slice(-2); // Get last 2 digits of the year

//     const hours = field.getHours().toString().padStart(2, '0');
//     const minutes = field.getMinutes().toString().padStart(2, '0');

//     return `${day}/${month}/${year} ${hours}:${minutes}`;
// }

export function timeOnlyToStringPrint(field: Date): string {

    if (!(field instanceof Date)) {
        field = new Date(field);
    }

    const hours = field.getHours().toString().padStart(2, '0');
    const minutes = field.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}
