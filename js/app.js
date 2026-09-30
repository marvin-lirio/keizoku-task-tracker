/*
    STORAGE
*/

import {
    loadData,
    saveData,
    getNextTaskNumber
} from "./storage.js";


/*
    TASK LOGIC
*/

import {
    prepareTaskText,
    validateTaskText,
    createTask,
    completeTask,
    createDeletionRecord,
    filterTasks,
    filterDeletedTasks,
    sortRecords
} from "./tasks.js";


/*
    UI
*/

import {
    renderUI
} from "./ui.js";


/*
    DOM REFERENCES

    app.js owns controls that generate
    application actions.

    ui.js owns elements concerned only
    with displaying application state.
*/

const taskForm =
    document.querySelector(
        "#task-form"
    );

const taskInput =
    document.querySelector(
        "#task-input"
    );

const priorityInput =
    document.querySelector(
        "#priority-input"
    );

const errorMessage =
    document.querySelector(
        "#error-message"
    );


const numberHeader =
    document.querySelector(
        "#number-header"
    );

const taskNameHeader =
    document.querySelector(
        "#task-name-header"
    );

const prioritySortButton =
    document.querySelector(
        "#priority-sort-button"
    );

const statusSortButton =
    document.querySelector(
        "#status-sort-button"
    );


const priorityFilterSelect =
    document.querySelector(
        "#priority-filter"
    );

const statusFilterSelect =
    document.querySelector(
        "#status-filter"
    );

const clearHistoryButton =
    document.querySelector(
        "#clear-history-button"
    );


/*
    LOAD APPLICATION DATA
*/

const storedData =
    loadData();


let tasks =
    storedData.tasks;

let deletionHistory =
    storedData.deletionHistory;


/*
    APPLICATION VIEW STATE
*/

const viewState = {

    activeSort:
        "number",

    numberSort:
        "ascending",

    taskNameSort:
        "ascending",

    prioritySort:
        "high-low",

    statusSort:
        "todo-done",

    priorityFilter:
        "all",

    statusFilter:
        "all"

};


/*
    GET DISPLAY RECORDS

    This prepares the records before
    handing them to the UI layer.

    Pipeline:

    application data
        ↓
    filter
        ↓
    sort
        ↓
    UI
*/

function getDisplayRecords() {

    const viewingDeleted =
        viewState.statusFilter ===
            "deleted";


    const filteredRecords =
        viewingDeleted
            ? filterDeletedTasks(
                deletionHistory,
                viewState.priorityFilter
            )
            : filterTasks(
                tasks,
                viewState.priorityFilter,
                viewState.statusFilter
            );


    const displayRecords =
        sortRecords(
            filteredRecords,
            {
                activeSort:
                    viewState.activeSort,

                numberSort:
                    viewState.numberSort,

                taskNameSort:
                    viewState.taskNameSort,

                prioritySort:
                    viewState.prioritySort,

                statusSort:
                    viewState.statusSort,

                viewingDeleted
            }
        );


    return {
        displayRecords,
        viewingDeleted
    };

}


/*
    COMPLETE TASK
*/

function handleCompleteTask(
    task
) {

    completeTask(task);


    saveData(
        tasks,
        deletionHistory
    );


    render();

}


/*
    DELETE TASK
*/

function handleDeleteTask(
    task
) {

    const confirmed =
        confirm(
            `Delete task #${task.number}: "${task.text}"?`
        );


    if (!confirmed) {

        return;

    }


    deletionHistory.push(
        createDeletionRecord(
            task
        )
    );


    tasks =
        tasks.filter(
            currentTask =>
                currentTask.id !==
                task.id
        );


    saveData(
        tasks,
        deletionHistory
    );


    render();

}


/*
    MAIN RENDER
*/

function render() {

    const {
        displayRecords,
        viewingDeleted
    } =
        getDisplayRecords();


    renderUI({

        tasks,

        deletionHistory,

        displayRecords,

        viewingDeleted,

        viewState,

        handlers: {

            onCompleteTask:
                handleCompleteTask,

            onDeleteTask:
                handleDeleteTask

        }

    });

}


/*
    ADD TASK
*/

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const taskText =
            prepareTaskText(
                taskInput.value
            );


        const validationError =
            validateTaskText(
                taskText,
                tasks
            );


        if (validationError) {

            errorMessage.textContent =
                validationError;

            return;

        }


        const newTask =
            createTask(
                taskText,
                priorityInput.value,
                getNextTaskNumber()
            );


        tasks.push(
            newTask
        );


        taskInput.value =
            "";

        priorityInput.value =
            "Medium";

        errorMessage.textContent =
            "";


        saveData(
            tasks,
            deletionHistory
        );


        render();

    }
);


/*
    TASK NUMBER SORT
*/

numberHeader.addEventListener(
    "click",
    () => {

        if (
            viewState.activeSort ===
                "number"
        ) {

            viewState.numberSort =
                viewState.numberSort ===
                    "ascending"
                    ? "descending"
                    : "ascending";

        } else {

            viewState.activeSort =
                "number";

            viewState.numberSort =
                "ascending";

        }


        render();

    }
);


/*
    TASK NAME SORT
*/

taskNameHeader.addEventListener(
    "click",
    () => {

        if (
            viewState.activeSort ===
                "task-name"
        ) {

            viewState.taskNameSort =
                viewState.taskNameSort ===
                    "ascending"
                    ? "descending"
                    : "ascending";

        } else {

            viewState.activeSort =
                "task-name";

            viewState.taskNameSort =
                "ascending";

        }


        render();

    }
);


/*
    PRIORITY SORT
*/

prioritySortButton.addEventListener(
    "click",
    () => {

        if (
            viewState.activeSort ===
                "priority"
        ) {

            viewState.prioritySort =
                viewState.prioritySort ===
                    "high-low"
                    ? "low-high"
                    : "high-low";

        } else {

            viewState.activeSort =
                "priority";

            viewState.prioritySort =
                "high-low";

        }


        render();

    }
);


/*
    STATUS SORT
*/

statusSortButton.addEventListener(
    "click",
    () => {

        if (
            viewState.activeSort ===
                "status"
        ) {

            viewState.statusSort =
                viewState.statusSort ===
                    "todo-done"
                    ? "done-todo"
                    : "todo-done";

        } else {

            viewState.activeSort =
                "status";

            viewState.statusSort =
                "todo-done";

        }


        render();

    }
);


/*
    PRIORITY FILTER
*/

priorityFilterSelect.addEventListener(
    "change",
    () => {

        viewState.priorityFilter =
            priorityFilterSelect.value;


        render();

    }
);


/*
    STATUS FILTER
*/

statusFilterSelect.addEventListener(
    "change",
    () => {

        viewState.statusFilter =
            statusFilterSelect.value;


        render();

    }
);


/*
    CLEAR DELETION HISTORY
*/

clearHistoryButton.addEventListener(
    "click",
    () => {

        if (
            deletionHistory.length === 0
        ) {

            return;

        }


        const confirmed =
            confirm(
                "Clear all deletion history?"
            );


        if (!confirmed) {

            return;

        }


        deletionHistory =
            [];


        saveData(
            tasks,
            deletionHistory
        );


        render();

    }
);


/*
    START APPLICATION
*/

render();