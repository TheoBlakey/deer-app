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

export interface Deer {
    userId?: string | null
    dateTime: Date;
    // placeId: string | null;
    species: Species | null;
    weight: number | null;
    age: number | null;
    sex: Sex | null;
    embryo: boolean | null;
    milk: boolean | null;
    comments: string;
}

export function validateDeer(deerToValidate: Deer): string[] {
    const validationIssues: string[] = [];

    const requiredFields: (keyof Deer)[] = [
        // 'userId', 'dateTime', 'species', 'weight', 'age', 'sex', 'embryo', 'milk', 'comments'
    ];

    requiredFields.forEach(field => {
        if (deerToValidate[field] === null || deerToValidate[field] === undefined) {
            validationIssues.push(field);
        }
    });

    // if (validationIssues.length > 0) {
    //     ("Please fill in the following fields: " + validationIssues.join(", "));
    // }

    return validationIssues;
}

export function createDefaultDeer(): Deer {
    return {
        userId: null,
        dateTime: new Date(),  // Current date and time
        // placeId: null,
        species: null,
        sex: null,
        age: null,
        weight: null,
        embryo: null,
        milk: null,
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
        comments: document.comments || '',
    };

    return newDeer;
}

// export function mapToDeer(document: Models.Document): Deer {

//     const propertiesToKeep = ["dateTime", "species", "weight", "age", "sex", "embryo", "milk", "comments"];
//     const reducedDoc = retainProperties(document, propertiesToKeep);

//     return reducedDoc as unknown as Deer;
// }

// const retainProperties = (obj: Record<string, any>, keysToKeep: string[]): Record<string, any> => {
//     const newObj: Record<string, any> = {};

//     for (const key of keysToKeep) {
//         if (key in obj) {
//             newObj[key] = obj[key];
//         }
//     }

//     return newObj;
// }



