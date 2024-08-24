export function allFieldsPassValidation(argRefList: any[]): boolean {
    let allPassedValidation = true;

    for (const fieldRef of argRefList) {
        if (!fieldRef.current.hasPassedValidation()) {
            allPassedValidation = false;
        }
    }

    return allPassedValidation;
}

export function resetAllValidation(argRefList: any[]): void {

    for (const fieldRef of argRefList) {
        fieldRef.current.resetValidation();
    }
}