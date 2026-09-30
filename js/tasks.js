/*
    VALID PRIORITIES
*/

const VALID_PRIORITIES = [
    "Low",
    "Medium",
    "High"
];


/*
    NORMALIZE TASK TEXT

    Used for validation and duplicate
    comparison without changing the text
    displayed to the user.
*/

export function normalizeTaskText(text) {

    return text
        .trim()
        .toLowerCase()
        .replace(
            /[.,!?;:'"]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        );

}


/*
    PREPARE TASK TEXT

    Removes leading/trailing whitespace
    and collapses repeated spaces while
    preserving the user's capitalization
    and punctuation.
*/

export function prepareTaskText(text) {

    return text
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


/*
    VALIDATE TASK TEXT

    Returns an error message when the
    proposed task cannot be added.

    An empty string means validation
    succeeded.
*/

export function validateTaskText(
    taskText,
    tasks
) {

    if (taskText === "") {

        return "Enter a task before adding it.";

    }


    const normalizedInput =
        normalizeTaskText(
            taskText
        );


    if (normalizedInput === "") {

        return "Enter a valid task name.";

    }


    const duplicateTask =
        tasks.some(
            task =>
                normalizeTaskText(
                    task.text
                ) ===
                normalizedInput
        );


    if (duplicateTask) {

        return "That task already exists.";

    }


    return "";

}


/*
    CREATE TASK

    This function creates the task object.

    The task number is supplied by the
    storage layer because storage owns
    sequential number allocation.
*/

export function createTask(
    text,
    priority,
    number
) {

    const safePriority =
        VALID_PRIORITIES.includes(
            priority
        )
            ? priority
            : "Medium";


    return {

        id:
            crypto.randomUUID(),

        number,

        text,

        completed:
            false,

        priority:
            safePriority

    };

}


/*
    COMPLETE TASK
*/

export function completeTask(task) {

    task.completed =
        true;

}


/*
    CREATE DELETION RECORD

    Converts an active task into the
    historical record stored when the
    task is deleted.
*/

export function createDeletionRecord(
    task
) {

    return {

        id:
            task.id,

        number:
            task.number,

        text:
            task.text,

        priority:
            task.priority,

        deletedAt:
            new Date()
                .toISOString()

    };

}


/*
    FILTER ACTIVE TASKS
*/

export function filterTasks(
    tasks,
    priorityFilter,
    statusFilter
) {

    return tasks.filter(task => {

        const matchesPriority =
            priorityFilter === "all" ||
            task.priority ===
                priorityFilter;


        const matchesStatus =
            statusFilter === "all" ||
            (
                statusFilter === "todo" &&
                !task.completed
            ) ||
            (
                statusFilter === "done" &&
                task.completed
            );


        return (
            matchesPriority &&
            matchesStatus
        );

    });

}


/*
    FILTER DELETED TASKS
*/

export function filterDeletedTasks(
    deletionHistory,
    priorityFilter
) {

    return deletionHistory.filter(
        deletedTask =>
            priorityFilter === "all" ||
            deletedTask.priority ===
                priorityFilter
    );

}


/*
    SORT RECORDS

    Sorting receives its settings instead
    of reading global application state.

    This makes the function independent
    from app.js.
*/

export function sortRecords(
    records,
    {
        activeSort,
        numberSort,
        taskNameSort,
        prioritySort,
        statusSort,
        viewingDeleted
    }
) {

    const sortedRecords =
        [...records];


    const priorityRank = {

        High: 3,
        Medium: 2,
        Low: 1

    };


    sortedRecords.sort(
        (recordA, recordB) => {

            /*
                TASK NAME
            */

            if (
                activeSort ===
                "task-name"
            ) {

                const nameComparison =
                    recordA.text.localeCompare(
                        recordB.text,
                        undefined,
                        {
                            sensitivity:
                                "base"
                        }
                    );


                if (
                    nameComparison !== 0
                ) {

                    return (
                        taskNameSort ===
                            "ascending"
                            ? nameComparison
                            : -nameComparison
                    );

                }


                return (
                    recordA.number -
                    recordB.number
                );

            }


            /*
                PRIORITY
            */

            if (
                activeSort ===
                "priority"
            ) {

                const priorityA =
                    priorityRank[
                        recordA.priority
                    ] || 2;

                const priorityB =
                    priorityRank[
                        recordB.priority
                    ] || 2;


                const priorityDifference =
                    prioritySort ===
                        "high-low"
                        ? priorityB -
                            priorityA
                        : priorityA -
                            priorityB;


                if (
                    priorityDifference !== 0
                ) {

                    return (
                        priorityDifference
                    );

                }


                return (
                    recordA.number -
                    recordB.number
                );

            }


            /*
                STATUS
            */

            if (
                activeSort ===
                "status"
            ) {

                if (viewingDeleted) {

                    return (
                        recordA.number -
                        recordB.number
                    );

                }


                const statusA =
                    recordA.completed
                        ? 1
                        : 0;

                const statusB =
                    recordB.completed
                        ? 1
                        : 0;


                const statusDifference =
                    statusSort ===
                        "todo-done"
                        ? statusA -
                            statusB
                        : statusB -
                            statusA;


                if (
                    statusDifference !== 0
                ) {

                    return (
                        statusDifference
                    );

                }


                return (
                    recordA.number -
                    recordB.number
                );

            }


            /*
                TASK NUMBER
            */

            if (
                numberSort ===
                    "descending"
            ) {

                return (
                    recordB.number -
                    recordA.number
                );

            }


            return (
                recordA.number -
                recordB.number
            );

        }
    );


    return sortedRecords;

}