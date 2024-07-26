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
    userId: string | null
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