const taskForm =
    document.querySelector("#task-form");

const taskInput =
    document.querySelector("#task-input");

const priorityInput =
    document.querySelector("#priority-input");

const statusFilter =
    document.querySelector("#status-filter");

const priorityFilter =
    document.querySelector("#priority-filter");

const sortFilter =
    document.querySelector("#sort-filter");

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


/*
    LOAD TASK DATA
*/

let tasks;

try {

    tasks =
        JSON.parse(
            localStorage.getItem("keizokuTasks")
        ) || [];

} catch (error) {

    tasks = [];

}


/*
    LOAD DELETION HISTORY
*/

let deletionHistory;

try {

    deletionHistory =
        JSON.parse(
            localStorage.getItem(
                "keizokuDeletionHistory"
            )
        ) || [];

} catch (error) {

    deletionHistory = [];

}


/*
    LOAD NEXT TASK NUMBER

    This value is application state.

    It exists independently from active tasks
    and deletion history so task numbers are
    never reused when history is cleared.
*/

let nextTaskNumber =
    Number(
        localStorage.getItem(
            "keizokuNextTaskNumber"
        )
    );


/*
    DATA MIGRATION

    Older versions of the application may contain:

    - tasks without priority
    - tasks without valid numbers
    - duplicate task numbers
    - a missing or stale next-task counter

    Startup migration repairs the data and ensures
    the counter can never move backward from the
    highest task number we can currently prove
    has existed.
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


    const usedNumbers =
        new Set();

    let highestNumber =
        0;


    tasks.forEach(task => {

        if (
            Number.isInteger(task.number) &&
            task.number > 0 &&
            !usedNumbers.has(task.number)
        ) {

            usedNumbers.add(
                task.number
            );

            highestNumber =
                Math.max(
                    highestNumber,
                    task.number
                );

        }

    });


    tasks.forEach(task => {

        const duplicateNumber =
            Number.isInteger(task.number) &&
            task.number > 0 &&
            tasks.filter(
                currentTask =>
                    currentTask.number ===
                    task.number
            ).length > 1;


        if (
            !Number.isInteger(task.number) ||
            task.number <= 0 ||
            duplicateNumber
        ) {

            do {

                highestNumber++;

            } while (
                usedNumbers.has(
                    highestNumber
                )
            );


            task.number =
                highestNumber;


            usedNumbers.add(
                task.number
            );

        }

    });


    const activeNumbers =
        tasks
            .map(
                task => task.number
            )
            .filter(
                number =>
                    Number.isInteger(number) &&
                    number > 0
            );


    const deletedNumbers =
        deletionHistory
            .map(
                task => task.number
            )
            .filter(
                number =>
                    Number.isInteger(number) &&
                    number > 0
            );


    const knownNumbers = [
        ...activeNumbers,
        ...deletedNumbers
    ];


    const highestKnownNumber =
        knownNumbers.length > 0
            ? Math.max(...knownNumbers)
            : 0;


    const minimumSafeNextNumber =
        highestKnownNumber + 1;


    if (
        !Number.isInteger(nextTaskNumber) ||
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


    saveData();

}


/*
    TASK NUMBER GENERATION

    Task numbering now has one responsibility:

    1. Read the persistent counter.
    2. Return that number.
    3. Increment the counter.
    4. Persist the incremented value.

    Deleting tasks or clearing history can no
    longer cause an old number to be reused.
*/

function getNextTaskNumber() {

    const assignedNumber =
        nextTaskNumber;


    nextTaskNumber++;


    localStorage.setItem(
        "keizokuNextTaskNumber",
        String(nextTaskNumber)
    );


    return assignedNumber;

}


/*
    NORMALIZATION

    Used for duplicate comparison.
*/

function normalizeTaskText(text) {

    return text
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:'"]/g, "")
        .replace(/\s+/g, " ");

}


/*
    SAVE APPLICATION DATA
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


    localStorage.setItem(
        "keizokuNextTaskNumber",
        String(nextTaskNumber)
    );

}


/*
    STATISTICS

    Statistics represent the complete task
    collection regardless of filtering
    or sorting.
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
    TASK FILTERING

    Filtering changes what is displayed.

    It does not modify the original tasks array.
*/

function getFilteredTasks() {

    const selectedStatus =
        statusFilter.value;

    const selectedPriority =
        priorityFilter.value;


    return tasks.filter(task => {

        const matchesStatus =
            selectedStatus === "all" ||
            selectedStatus === "remaining" &&
                !task.completed ||
            selectedStatus === "completed" &&
                task.completed;


        const matchesPriority =
            selectedPriority === "all" ||
            task.priority ===
                selectedPriority;


        return (
            matchesStatus &&
            matchesPriority
        );

    });

}


/*
    TASK SORTING

    Sorting changes display order only.

    A copy of the filtered array is sorted so
    the original tasks array is never reordered.
*/

function getSortedTasks(
    tasksToSort
) {

    const selectedSort =
        sortFilter.value;


    const sortedTasks =
        [...tasksToSort];


    const priorityRank = {

        High: 3,
        Medium: 2,
        Low: 1

    };


    if (
        selectedSort ===
        "priority-high"
    ) {

        sortedTasks.sort(
            (taskA, taskB) => {

                const priorityDifference =
                    priorityRank[
                        taskB.priority
                    ] -
                    priorityRank[
                        taskA.priority
                    ];


                if (
                    priorityDifference !== 0
                ) {

                    return (
                        priorityDifference
                    );

                }


                return (
                    taskA.number -
                    taskB.number
                );

            }
        );

    } else if (
        selectedSort ===
        "priority-low"
    ) {

        sortedTasks.sort(
            (taskA, taskB) => {

                const priorityDifference =
                    priorityRank[
                        taskA.priority
                    ] -
                    priorityRank[
                        taskB.priority
                    ];


                if (
                    priorityDifference !== 0
                ) {

                    return (
                        priorityDifference
                    );

                }


                return (
                    taskA.number -
                    taskB.number
                );

            }
        );

    } else {

        sortedTasks.sort(
            (taskA, taskB) =>
                taskA.number -
                taskB.number
        );

    }


    return sortedTasks;

}


/*
    TASK RENDERING
*/

function renderTasks() {

    taskList.innerHTML =
        "";


    const filteredTasks =
        getFilteredTasks();


    const displayTasks =
        getSortedTasks(
            filteredTasks
        );


    displayTasks.forEach(task => {

        const taskItem =
            document.createElement(
                "li"
            );


        taskItem.className =
            "task";


        if (task.completed) {

            taskItem.classList.add(
                "completed"
            );

        }


        const checkbox =
            document.createElement(
                "input"
            );


        checkbox.type =
            "checkbox";

        checkbox.className =
            "task-checkbox";

        checkbox.checked =
            task.completed;

        checkbox.disabled =
            task.completed;


        const taskContent =
            document.createElement(
                "div"
            );

        taskContent.className =
            "task-content";


        const taskText =
            document.createElement(
                "span"
            );


        taskText.className =
            "task-text";


        taskText.textContent =
            `#${task.number} ${task.text}`;


        const taskPriority =
            document.createElement(
                "span"
            );


        taskPriority.className =
            `task-priority priority-${task.priority.toLowerCase()}`;


        taskPriority.textContent =
            task.priority;


        taskContent.append(
            taskText,
            taskPriority
        );


        const deleteButton =
            document.createElement(
                "button"
            );


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

                if (
                    task.completed
                ) {

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

    historyList.innerHTML =
        "";


    const newestFirst =
        [...deletionHistory]
            .reverse();


    newestFirst.forEach(
        deletedTask => {

            const historyItem =
                document.createElement(
                    "li"
                );


            historyItem.className =
                "history-item";


            const historyContent =
                document.createElement(
                    "div"
                );


            historyContent.className =
                "history-content";


            const historyTask =
                document.createElement(
                    "div"
                );


            historyTask.className =
                "history-task";


            historyTask.textContent =
                `#${deletedTask.number} ${deletedTask.text}`;


            const historyPriority =
                document.createElement(
                    "span"
                );


            historyPriority.className =
                `task-priority priority-${(
                    deletedTask.priority ||
                    "Medium"
                ).toLowerCase()}`;


            historyPriority.textContent =
                deletedTask.priority ||
                "Medium";


            historyContent.append(
                historyTask,
                historyPriority
            );


            const historyDate =
                document.createElement(
                    "div"
                );


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


    if (
        deletionHistory.length === 0
    ) {

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
                .replace(
                    /\s+/g,
                    " "
                );


        if (
            taskText === ""
        ) {

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

    Clearing history intentionally does NOT
    change nextTaskNumber.
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


        saveData();

        renderHistory();

    }
);


/*
    FILTER AND SORT CONTROLS

    These controls change presentation only.

    They do not modify or save task data.
*/

statusFilter.addEventListener(
    "change",
    () => {

        renderTasks();

    }
);


priorityFilter.addEventListener(
    "change",
    () => {

        renderTasks();

    }
);


sortFilter.addEventListener(
    "change",
    () => {

        renderTasks();

    }
);


/*
    START APPLICATION
*/

migrateTaskData();

renderTasks();

renderHistory();