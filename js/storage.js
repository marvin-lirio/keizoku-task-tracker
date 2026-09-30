const TASKS_KEY =
    "keizokuTasks";

const DELETION_HISTORY_KEY =
    "keizokuDeletionHistory";

const NEXT_TASK_NUMBER_KEY =
    "keizokuNextTaskNumber";


let nextTaskNumber = 1;


/*
    SAVE APPLICATION DATA
*/

export function saveData(
    tasks,
    deletionHistory
) {

    localStorage.setItem(
        TASKS_KEY,
        JSON.stringify(tasks)
    );

    localStorage.setItem(
        DELETION_HISTORY_KEY,
        JSON.stringify(
            deletionHistory
        )
    );

    localStorage.setItem(
        NEXT_TASK_NUMBER_KEY,
        String(nextTaskNumber)
    );

}


/*
    LOAD STORED ARRAY

    Invalid JSON or valid JSON that is not
    an array safely becomes an empty array.
*/

function loadStoredArray(key) {

    try {

        const storedData =
            JSON.parse(
                localStorage.getItem(key)
            );

        return Array.isArray(storedData)
            ? storedData
            : [];

    } catch (error) {

        return [];

    }

}


/*
    DATA MIGRATION

    Existing tasks from older versions of
    the application are brought forward
    into the current data structure.

    The first valid occurrence of a task
    number is preserved. Invalid or later
    duplicate numbers are reassigned.
*/

function migrateTaskData(
    tasks,
    deletionHistory
) {

    tasks.forEach(task => {

        if (
            ![
                "Low",
                "Medium",
                "High"
            ].includes(task.priority)
        ) {

            task.priority =
                "Medium";

        }

    });


    const originalValidNumbers =
        tasks
            .map(
                task => task.number
            )
            .filter(
                number =>
                    Number.isInteger(number) &&
                    number > 0
            );


    const deletedValidNumbers =
        deletionHistory
            .map(
                record => record.number
            )
            .filter(
                number =>
                    Number.isInteger(number) &&
                    number > 0
            );


    let highestKnownNumber =
        Math.max(
            0,
            ...originalValidNumbers,
            ...deletedValidNumbers
        );


    const seenNumbers =
        new Set();


    tasks.forEach(task => {

        const validNumber =
            Number.isInteger(task.number) &&
            task.number > 0 &&
            !seenNumbers.has(task.number);


        if (validNumber) {

            seenNumbers.add(
                task.number
            );

            return;

        }


        do {

            highestKnownNumber++;

        } while (
            seenNumbers.has(
                highestKnownNumber
            )
        );


        task.number =
            highestKnownNumber;

        seenNumbers.add(
            task.number
        );

    });


    const minimumSafeNextNumber =
        highestKnownNumber + 1;


    if (
        !Number.isInteger(
            nextTaskNumber
        ) ||
        nextTaskNumber < 1
    ) {

        nextTaskNumber =
            minimumSafeNextNumber;

    } else {

        nextTaskNumber =
            Math.max(
                nextTaskNumber,
                minimumSafeNextNumber
            );

    }

}


/*
    LOAD APPLICATION DATA
*/

export function loadData() {

    const tasks =
        loadStoredArray(
            TASKS_KEY
        );

    const deletionHistory =
        loadStoredArray(
            DELETION_HISTORY_KEY
        );


    nextTaskNumber =
        Number(
            localStorage.getItem(
                NEXT_TASK_NUMBER_KEY
            )
        );


    migrateTaskData(
        tasks,
        deletionHistory
    );


    saveData(
        tasks,
        deletionHistory
    );


    return {
        tasks,
        deletionHistory
    };

}


/*
    TASK NUMBER GENERATION
*/

export function getNextTaskNumber() {

    const assignedNumber =
        nextTaskNumber;


    nextTaskNumber++;


    localStorage.setItem(
        NEXT_TASK_NUMBER_KEY,
        String(nextTaskNumber)
    );


    return assignedNumber;

}