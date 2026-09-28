const taskForm =
    document.querySelector("#task-form");

const taskInput =
    document.querySelector("#task-input");

const priorityInput =
    document.querySelector("#priority-input");

const taskList =
    document.querySelector("#task-list");

const errorMessage =
    document.querySelector("#error-message");


const totalCount =
    document.querySelector("#total-count");

const remainingCount =
    document.querySelector("#remaining-count");

const completedCount =
    document.querySelector("#completed-count");

const deletedCount =
    document.querySelector("#deleted-count");


const emptyState =
    document.querySelector("#empty-state");


const historyList =
    document.querySelector("#history-list");

const historyEmptyState =
    document.querySelector("#history-empty-state");

const clearHistoryButton =
    document.querySelector("#clear-history-button");


let tasks;

try {

    tasks =
        JSON.parse(
            localStorage.getItem("keizokuTasks")
        ) || [];

} catch (error) {

    tasks = [];

}


let deletionHistory =
    JSON.parse(
        localStorage.getItem("keizokuDeletionHistory")
    ) || [];


/*
    DATA MIGRATION

    Older versions of the application created tasks
    without sequential task numbers or priority values.

    When the application starts, existing tasks are
    inspected and missing data is assigned.
*/

function migrateTaskData() {

    tasks.forEach(task => {

        if (
            !["Low", "Medium", "High"].includes(
                task.priority
            )
        ) {

            task.priority =
                "Medium";

        }

    });


    const usedNumbers = new Set();

    let highestNumber = 0;


    tasks.forEach(task => {

        if (
            Number.isInteger(task.number) &&
            task.number > 0 &&
            !usedNumbers.has(task.number)
        ) {

            usedNumbers.add(task.number);

            highestNumber =
                Math.max(
                    highestNumber,
                    task.number
                );

        }

    });


    tasks.forEach(task => {

        if (
            !Number.isInteger(task.number) ||
            task.number <= 0 ||
            usedNumbers.has(task.number) &&
            tasks.filter(
                currentTask =>
                    currentTask.number === task.number
            ).length > 1
        ) {

            do {

                highestNumber++;

            } while (
                usedNumbers.has(highestNumber)
            );


            task.number = highestNumber;

            usedNumbers.add(task.number);

        }

    });


    localStorage.setItem(
        "keizokuTasks",
        JSON.stringify(tasks)
    );

}


/*
    NEXT TASK NUMBER

    Instead of trusting a separately stored counter,
    determine the next number from the existing data.

    Deleted task numbers are also considered so
    identifiers are never reused.
*/

function getNextTaskNumber() {

    const activeNumbers =
        tasks.map(
            task => task.number || 0
        );


    const deletedNumbers =
        deletionHistory.map(
            task => task.number || 0
        );


    const allNumbers = [
        ...activeNumbers,
        ...deletedNumbers
    ];


    if (allNumbers.length === 0) {

        return 1;

    }


    return Math.max(...allNumbers) + 1;

}


/*
    NORMALIZATION

    Used for duplicate comparison.

    Example:

    "  Finish   Day 3  "

    becomes:

    "finish day 3"
*/

function normalizeTaskText(text) {

    return text
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:'"]/g, "")
        .replace(/\s+/g, " ");

}


/*
    SAVE
*/

function saveData() {

    localStorage.setItem(
        "keizokuTasks",
        JSON.stringify(tasks)
    );


    localStorage.setItem(
        "keizokuDeletionHistory",
        JSON.stringify(deletionHistory)
    );

}


/*
    STATISTICS
*/

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            task => task.completed
        ).length;


    const remaining =
        total - completed;


    totalCount.textContent =
        total;

    completedCount.textContent =
        completed;

    remainingCount.textContent =
        remaining;

    deletedCount.textContent =
        deletionHistory.length;


    if (total === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }

}


/*
    TASK RENDERING
*/

function renderTasks() {

    taskList.innerHTML = "";


    tasks.forEach(task => {

        const taskItem =
            document.createElement("li");


        taskItem.className =
            "task";


        if (task.completed) {

            taskItem.classList.add(
                "completed"
            );

        }


        const checkbox =
            document.createElement("input");


        checkbox.type =
            "checkbox";

        checkbox.className =
            "task-checkbox";

        checkbox.checked =
            task.completed;

        checkbox.disabled =
            task.completed;


        const taskContent =
            document.createElement("div");

        taskContent.className =
            "task-content";


        const taskText =
            document.createElement("span");


        taskText.className =
            "task-text";


        taskText.textContent =
            `#${task.number} ${task.text}`;


        const taskPriority =
            document.createElement("span");

        taskPriority.className =
            `task-priority priority-${task.priority.toLowerCase()}`;

        taskPriority.textContent =
            task.priority;


        taskContent.append(
            taskText,
            taskPriority
        );


        const deleteButton =
            document.createElement("button");


        deleteButton.className =
            "delete-button";


        if (task.completed) {

            deleteButton.textContent =
                "Completed";

            deleteButton.disabled =
                true;

        } else {

            deleteButton.textContent =
                "Delete";

        }


        checkbox.addEventListener(
            "change",
            () => {

                task.completed =
                    checkbox.checked;


                saveData();

                renderTasks();

            }
        );


        deleteButton.addEventListener(
            "click",
            () => {

                if (task.completed) {

                    return;

                }


                const confirmed =
                    confirm(
                        `Delete task #${task.number}: "${task.text}"?`
                    );


                if (!confirmed) {

                    return;

                }


                deletionHistory.push({

                    id: task.id,

                    number: task.number,

                    text: task.text,

                    priority: task.priority,

                    deletedAt:
                        new Date().toISOString()

                });


                tasks =
                    tasks.filter(
                        currentTask =>
                            currentTask.id !==
                            task.id
                    );


                saveData();

                renderTasks();

                renderHistory();

            }
        );


        taskItem.append(
            checkbox,
            taskContent,
            deleteButton
        );


        taskList.appendChild(
            taskItem
        );

    });


    updateStats();

}


/*
    DELETION HISTORY RENDERING
*/

function renderHistory() {

    historyList.innerHTML = "";


    const newestFirst =
        [...deletionHistory].reverse();


    newestFirst.forEach(
        deletedTask => {

            const historyItem =
                document.createElement("li");


            historyItem.className =
                "history-item";


            const historyContent =
                document.createElement("div");

            historyContent.className =
                "history-content";


            const historyTask =
                document.createElement("div");


            historyTask.className =
                "history-task";


            historyTask.textContent =
                `#${deletedTask.number} ${deletedTask.text}`;


            const historyPriority =
                document.createElement("span");

            historyPriority.className =
                `task-priority priority-${(
                    deletedTask.priority || "Medium"
                ).toLowerCase()}`;

            historyPriority.textContent =
                deletedTask.priority || "Medium";


            historyContent.append(
                historyTask,
                historyPriority
            );


            const historyDate =
                document.createElement("div");


            historyDate.className =
                "history-date";


            historyDate.textContent =
                new Date(
                    deletedTask.deletedAt
                ).toLocaleString();


            historyItem.append(
                historyContent,
                historyDate
            );


            historyList.appendChild(
                historyItem
            );

        }
    );


    if (deletionHistory.length === 0) {

        historyEmptyState.style.display =
            "block";

        clearHistoryButton.disabled =
            true;

    } else {

        historyEmptyState.style.display =
            "none";

        clearHistoryButton.disabled =
            false;

    }


    deletedCount.textContent =
        deletionHistory.length;

}


/*
    ADD TASK
*/

taskForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const taskText =
            taskInput.value
                .trim()
                .replace(/\s+/g, " ");


        if (taskText === "") {

            errorMessage.textContent =
                "Enter a task before adding it.";

            return;

        }


        const normalizedInput =
            normalizeTaskText(
                taskText
            );


        const duplicateTask =
            tasks.some(
                task =>
                    normalizeTaskText(
                        task.text
                    ) ===
                    normalizedInput
            );


        if (duplicateTask) {

            errorMessage.textContent =
                "That task already exists.";

            return;

        }


        const newTask = {

            id:
                crypto.randomUUID(),

            number:
                getNextTaskNumber(),

            text:
                taskText,

            completed:
                false,

            priority:
                priorityInput.value

        };


        tasks.push(
            newTask
        );


        taskInput.value =
            "";

        priorityInput.value =
            "Medium";

        errorMessage.textContent =
            "";


        saveData();

        renderTasks();

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


        deletionHistory = [];


        saveData();

        renderHistory();

    }
);


/*
    START APPLICATION
*/

migrateTaskData();

renderTasks();

renderHistory();