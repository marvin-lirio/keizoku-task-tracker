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

const clearHistoryButton =
    document.querySelector(
        "#clear-history-button"
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


const numberSortIndicator =
    document.querySelector(
        "#number-sort-indicator"
    );

const taskNameSortIndicator =
    document.querySelector(
        "#task-name-sort-indicator"
    );

const prioritySortIndicator =
    document.querySelector(
        "#priority-sort-indicator"
    );

const statusSortIndicator =
    document.querySelector(
        "#status-sort-indicator"
    );


/*
    APPLICATION VIEW STATE

    Sorting and filtering are independent.

    activeSort determines which column controls
    the current display order.

    Filters determine which records are visible.
*/

let activeSort =
    "number";

let numberSort =
    "ascending";

let taskNameSort =
    "ascending";

let prioritySort =
    "high-low";

let statusSort =
    "todo-done";

let priorityFilter =
    "all";

let statusFilter =
    "all";


/*
    LOAD TASK DATA
*/

let tasks;

try {

    const storedTasks =
        JSON.parse(
            localStorage.getItem(
                "keizokuTasks"
            )
        );

    tasks =
        Array.isArray(storedTasks)
            ? storedTasks
            : [];

} catch (error) {

    tasks = [];

}


/*
    LOAD DELETION HISTORY
*/

let deletionHistory;

try {

    const storedHistory =
        JSON.parse(
            localStorage.getItem(
                "keizokuDeletionHistory"
            )
        );

    deletionHistory =
        Array.isArray(storedHistory)
            ? storedHistory
            : [];

} catch (error) {

    deletionHistory = [];

}


/*
    LOAD NEXT TASK NUMBER
*/

let nextTaskNumber =
    Number(
        localStorage.getItem(
            "keizokuNextTaskNumber"
        )
    );


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
        JSON.stringify(
            deletionHistory
        )
    );

    localStorage.setItem(
        "keizokuNextTaskNumber",
        String(nextTaskNumber)
    );

}


/*
    DATA MIGRATION
*/

function migrateTaskData() {

    tasks.forEach(task => {

        if (
            ![
                "Low",
                "Medium",
                "High"
            ].includes(
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
            Number.isInteger(
                task.number
            ) &&
            task.number > 0 &&
            tasks.filter(
                currentTask =>
                    currentTask.number ===
                    task.number
            ).length > 1;


        if (
            !Number.isInteger(
                task.number
            ) ||
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
                    Number.isInteger(
                        number
                    ) &&
                    number > 0
            );


    const deletedNumbers =
        deletionHistory
            .map(
                task => task.number
            )
            .filter(
                number =>
                    Number.isInteger(
                        number
                    ) &&
                    number > 0
            );


    const knownNumbers = [
        ...activeNumbers,
        ...deletedNumbers
    ];


    const highestKnownNumber =
        knownNumbers.length > 0
            ? Math.max(
                ...knownNumbers
            )
            : 0;


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


    saveData();

}


/*
    TASK NUMBER GENERATION
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
    DUPLICATE NORMALIZATION
*/

function normalizeTaskText(text) {

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

    remainingCount.textContent =
        remaining;

    completedCount.textContent =
        completed;

    deletedCount.textContent =
        deletionHistory.length;

}


/*
    HEADER STATE

    Only the active sorting column displays
    its sorting direction.

    Priority and Status filters remain visible
    independently of sorting.
*/

function updateHeaderState() {

    numberHeader.classList.toggle(
        "active",
        activeSort === "number"
    );

    taskNameHeader.classList.toggle(
        "active",
        activeSort === "task-name"
    );

    prioritySortButton.classList.toggle(
        "active",
        activeSort === "priority"
    );

    statusSortButton.classList.toggle(
        "active",
        activeSort === "status"
    );


    numberSortIndicator.textContent =
        activeSort === "number"
            ? (
                numberSort === "ascending"
                    ? "↑"
                    : "↓"
            )
            : "";


    taskNameSortIndicator.textContent =
        activeSort === "task-name"
            ? (
                taskNameSort === "ascending"
                    ? "A–Z"
                    : "Z–A"
            )
            : "";


    prioritySortIndicator.textContent =
        activeSort === "priority"
            ? (
                prioritySort === "high-low"
                    ? "↓"
                    : "↑"
            )
            : "";


    statusSortIndicator.textContent =
        activeSort === "status"
            ? (
                statusSort === "todo-done"
                    ? "↑"
                    : "↓"
            )
            : "";


    priorityFilterSelect.classList.toggle(
        "active",
        priorityFilter !== "all"
    );

    statusFilterSelect.classList.toggle(
        "active",
        statusFilter !== "all"
    );


    clearHistoryButton.hidden =
        statusFilter !== "deleted" ||
        deletionHistory.length === 0;

}


/*
    FILTER ACTIVE TASKS
*/

function getFilteredTasks() {

    return tasks.filter(task => {

        const matchesPriority =
            priorityFilter === "all" ||
            task.priority ===
                priorityFilter;


        const matchesStatus =
            statusFilter === "all" ||
            statusFilter === "todo" &&
                !task.completed ||
            statusFilter === "done" &&
                task.completed;


        return (
            matchesPriority &&
            matchesStatus
        );

    });

}


/*
    SORT RECORDS

    Only one sorting column is active.

    Priority:
        High → Medium → Low
        Low → Medium → High

    Status:
        To Do → Done
        Done → To Do

    Task number is used as the final tie breaker
    so sorting remains deterministic.
*/

function sortRecords(
    records
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

                Deleted records all have the
                same status, so task number is
                used when viewing Deleted.
            */

            if (
                activeSort ===
                "status"
            ) {

                if (
                    statusFilter ===
                        "deleted"
                ) {

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


/*
    CREATE PRIORITY BADGE
*/

function createPriorityBadge(
    priority
) {

    const badge =
        document.createElement(
            "span"
        );


    const safePriority =
        [
            "Low",
            "Medium",
            "High"
        ].includes(priority)
            ? priority
            : "Medium";


    badge.className =
        `task-priority priority-${safePriority.toLowerCase()}`;

    badge.textContent =
        safePriority;


    return badge;

}


/*
    CREATE TRASH BUTTON
*/

function createDeleteButton(
    task
) {

    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "delete-button";

    deleteButton.type =
        "button";

    deleteButton.setAttribute(
        "aria-label",
        `Delete task #${task.number}`
    );


    deleteButton.innerHTML = `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M4 7h16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            />
            <path
                d="M9 7V4h6v3"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
            />
            <path
                d="M6.5 7l1 13h9l1-13"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linejoin="round"
            />
            <path
                d="M10 11v5M14 11v5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
            />
        </svg>
    `;


    deleteButton.addEventListener(
        "click",
        () => {

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

            render();

        }
    );


    return deleteButton;

}


/*
    RENDER ACTIVE TASK
*/

function createTaskRow(
    task
) {

    const taskItem =
        document.createElement(
            "li"
        );


    taskItem.className =
        "task";

    taskItem.setAttribute(
        "role",
        "row"
    );


    if (task.completed) {

        taskItem.classList.add(
            "completed"
        );

    }


    /*
        CHECKBOX
    */

    const checkboxCell =
        document.createElement(
            "div"
        );

    checkboxCell.className =
        "task-checkbox-cell";


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

    checkbox.setAttribute(
        "aria-label",
        `Mark task #${task.number} complete`
    );


    checkbox.addEventListener(
        "change",
        () => {

            task.completed =
                true;

            saveData();

            render();

        }
    );


    checkboxCell.appendChild(
        checkbox
    );


    /*
        TASK NUMBER
    */

    const numberCell =
        document.createElement(
            "div"
        );

    numberCell.className =
        "task-number";

    numberCell.textContent =
        `#${task.number}`;


    /*
        TASK NAME
    */

    const nameCell =
        document.createElement(
            "div"
        );

    nameCell.className =
        "task-name";

    nameCell.textContent =
        task.text;


    /*
        PRIORITY
    */

    const priorityCell =
        document.createElement(
            "div"
        );

    priorityCell.className =
        "task-priority-cell";

    priorityCell.appendChild(
        createPriorityBadge(
            task.priority
        )
    );


    /*
        STATUS
    */

    const statusCell =
        document.createElement(
            "div"
        );

    statusCell.className =
        "task-status-cell";


    const status =
        document.createElement(
            "span"
        );

    status.className =
        "task-status";


    if (task.completed) {

        status.textContent =
            "Done";

        status.classList.add(
            "status-done"
        );

        statusCell.appendChild(
            status
        );

    } else {

        status.textContent =
            "To Do";

        statusCell.append(
            status,
            createDeleteButton(task)
        );

    }


    taskItem.append(
        checkboxCell,
        numberCell,
        nameCell,
        priorityCell,
        statusCell
    );


    return taskItem;

}


/*
    RENDER DELETED TASK
*/

function createDeletedRow(
    deletedTask
) {

    const taskItem =
        document.createElement(
            "li"
        );


    taskItem.className =
        "task deleted";

    taskItem.setAttribute(
        "role",
        "row"
    );


    const checkboxCell =
        document.createElement(
            "div"
        );

    checkboxCell.className =
        "task-checkbox-cell";


    const numberCell =
        document.createElement(
            "div"
        );

    numberCell.className =
        "task-number";

    numberCell.textContent =
        `#${deletedTask.number}`;


    const nameCell =
        document.createElement(
            "div"
        );

    nameCell.className =
        "task-name";

    nameCell.textContent =
        deletedTask.text;


    const priorityCell =
        document.createElement(
            "div"
        );

    priorityCell.className =
        "task-priority-cell";

    priorityCell.appendChild(
        createPriorityBadge(
            deletedTask.priority
        )
    );


    const statusCell =
        document.createElement(
            "div"
        );

    statusCell.className =
        "task-status-cell";


    const status =
        document.createElement(
            "span"
        );

    status.className =
        "task-status status-deleted";


    const statusText =
        document.createElement(
            "span"
        );

    statusText.textContent =
        "Deleted";


    const deletedDate =
        document.createElement(
            "span"
        );

    deletedDate.className =
        "deleted-date";

    deletedDate.textContent =
        new Date(
            deletedTask.deletedAt
        ).toLocaleString();


    status.append(
        statusText,
        deletedDate
    );

    statusCell.appendChild(
        status
    );


    taskItem.append(
        checkboxCell,
        numberCell,
        nameCell,
        priorityCell,
        statusCell
    );


    return taskItem;

}


/*
    RENDER TABLE
*/

function renderTable() {

    taskList.innerHTML =
        "";


    let displayRecords;


    /*
        DELETED VIEW
    */

    if (
        statusFilter === "deleted"
    ) {

        displayRecords =
            deletionHistory.filter(
                deletedTask =>
                    priorityFilter ===
                        "all" ||
                    deletedTask.priority ===
                        priorityFilter
            );


        displayRecords =
            sortRecords(
                displayRecords
            );


        displayRecords.forEach(
            deletedTask => {

                taskList.appendChild(
                    createDeletedRow(
                        deletedTask
                    )
                );

            }
        );

    } else {

        /*
            ACTIVE TASK VIEW
        */

        displayRecords =
            getFilteredTasks();


        displayRecords =
            sortRecords(
                displayRecords
            );


        displayRecords.forEach(
            task => {

                taskList.appendChild(
                    createTaskRow(task)
                );

            }
        );

    }


    /*
        EMPTY STATE
    */

    if (
        displayRecords.length === 0
    ) {

        emptyState.style.display =
            "block";


        if (
            statusFilter === "deleted"
        ) {

            emptyState.textContent =
                "No deleted tasks.";

        } else if (
            statusFilter === "todo"
        ) {

            emptyState.textContent =
                "No tasks to do.";

        } else if (
            statusFilter === "done"
        ) {

            emptyState.textContent =
                "No completed tasks.";

        } else if (
            priorityFilter !== "all"
        ) {

            emptyState.textContent =
                `No ${priorityFilter.toLowerCase()} priority tasks.`;

        } else {

            emptyState.textContent =
                "No tasks yet.";

        }

    } else {

        emptyState.style.display =
            "none";

    }

}


/*
    MAIN RENDER
*/

function render() {

    updateStats();

    updateHeaderState();

    renderTable();

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


        if (
            normalizedInput === ""
        ) {

            errorMessage.textContent =
                "Enter a valid task name.";

            return;

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
            activeSort ===
                "number"
        ) {

            numberSort =
                numberSort ===
                    "ascending"
                    ? "descending"
                    : "ascending";

        } else {

            activeSort =
                "number";

            numberSort =
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
            activeSort ===
                "task-name"
        ) {

            taskNameSort =
                taskNameSort ===
                    "ascending"
                    ? "descending"
                    : "ascending";

        } else {

            activeSort =
                "task-name";

            taskNameSort =
                "ascending";

        }


        render();

    }
);


/*
    PRIORITY SORT

    First activation:
        High → Medium → Low

    Additional click:
        Low → Medium → High
*/

prioritySortButton.addEventListener(
    "click",
    () => {

        if (
            activeSort ===
                "priority"
        ) {

            prioritySort =
                prioritySort ===
                    "high-low"
                    ? "low-high"
                    : "high-low";

        } else {

            activeSort =
                "priority";

            prioritySort =
                "high-low";

        }


        render();

    }
);


/*
    STATUS SORT

    First activation:
        To Do → Done

    Additional click:
        Done → To Do
*/

statusSortButton.addEventListener(
    "click",
    () => {

        if (
            activeSort ===
                "status"
        ) {

            statusSort =
                statusSort ===
                    "todo-done"
                    ? "done-todo"
                    : "todo-done";

        } else {

            activeSort =
                "status";

            statusSort =
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

        priorityFilter =
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

        statusFilter =
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


        saveData();

        render();

    }
);


/*
    START APPLICATION
*/

migrateTaskData();

render();