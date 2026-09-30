/*
    DOM REFERENCES
*/

const taskList =
    document.querySelector(
        "#task-list"
    );

const totalCount =
    document.querySelector(
        "#total-count"
    );

const remainingCount =
    document.querySelector(
        "#remaining-count"
    );

const completedCount =
    document.querySelector(
        "#completed-count"
    );

const deletedCount =
    document.querySelector(
        "#deleted-count"
    );

const emptyState =
    document.querySelector(
        "#empty-state"
    );

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
    UPDATE STATISTICS
*/

function updateStats(
    tasks,
    deletionHistory
) {

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
    UPDATE HEADER STATE
*/

function updateHeaderState(
    viewState,
    deletionHistory
) {

    const {
        activeSort,
        numberSort,
        taskNameSort,
        prioritySort,
        statusSort,
        priorityFilter,
        statusFilter
    } = viewState;


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
    CREATE DELETE BUTTON

    The UI does not perform deletion.

    Instead, it calls the callback supplied
    by app.js when the user requests it.
*/

function createDeleteButton(
    task,
    onDeleteTask
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

            onDeleteTask(task);

        }
    );


    return deleteButton;

}


/*
    CREATE ACTIVE TASK ROW
*/

function createTaskRow(
    task,
    {
        onCompleteTask,
        onDeleteTask
    }
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

            onCompleteTask(task);

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
            createDeleteButton(
                task,
                onDeleteTask
            )
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
    CREATE DELETED TASK ROW
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
    UPDATE EMPTY STATE
*/

function updateEmptyState(
    displayRecords,
    viewState
) {

    const {
        priorityFilter,
        statusFilter
    } = viewState;


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
    RENDER TABLE

    app.js supplies the records that should
    be displayed. ui.js only renders them.
*/

function renderTable(
    displayRecords,
    viewingDeleted,
    handlers,
    viewState
) {

    taskList.innerHTML =
        "";


    displayRecords.forEach(
        record => {

            const row =
                viewingDeleted
                    ? createDeletedRow(
                        record
                    )
                    : createTaskRow(
                        record,
                        handlers
                    );


            taskList.appendChild(
                row
            );

        }
    );


    updateEmptyState(
        displayRecords,
        viewState
    );

}


/*
    MAIN UI RENDER

    This is the public rendering interface
    used by app.js.
*/

export function renderUI({
    tasks,
    deletionHistory,
    displayRecords,
    viewingDeleted,
    viewState,
    handlers
}) {

    updateStats(
        tasks,
        deletionHistory
    );

    updateHeaderState(
        viewState,
        deletionHistory
    );

    renderTable(
        displayRecords,
        viewingDeleted,
        handlers,
        viewState
    );

}