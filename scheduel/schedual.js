let shiftRowCount = 1;
let employeeRowCount = 1;
const employeeMap = {};  // Global mapping for nickname to full name

function calculateDuration(row) {
  const startTime = document.getElementById(`start-time-${row}`).value;
  const endTime = document.getElementById(`end-time-${row}`).value;

  if (startTime && endTime) {
    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(`1970-01-01T${endTime}Z`);
    let duration = (end - start) / (1000 * 60 * 60);

    if (duration < 0) {
      duration += 24;
    }

    document.getElementById(`duration-${row}`).innerText = duration.toFixed(2);
  }
}

function handleEmployeeChange(employee, date, row) {
  const slot = document.getElementById(`${date}-${row}`);
  const durationElement = document.getElementById(`duration-${row}`);
  const duration = parseFloat(durationElement.innerText);

  // Resolve nickname or full name to a unique key
  const resolvedEmployee = resolveEmployee(employee);

  if (employee.trim() === "") {
    const previousEmployee = slot.getAttribute('data-previous-employee');
    if (previousEmployee) {
      removeEmployeeFromSlot(previousEmployee, date, duration);
      slot.removeAttribute('data-previous-employee');
    }
  } else {
    const previousEmployee = slot.getAttribute('data-previous-employee');
    if (previousEmployee) {
      removeEmployeeFromSlot(previousEmployee, date, duration);
    }
    slot.setAttribute('data-previous-employee', resolvedEmployee);
    updateTotalHours(resolvedEmployee, date, duration, "add");
  }
}

function resolveEmployee(employee) {
  return employeeMap[employee.toLowerCase()] || employee.toLowerCase().replace(/\s/g, '-');
}

function removeEmployeeFromSlot(employee, date, duration) {
  updateTotalHours(employee, date, duration, "subtract");
}

function updateTotalHours(employee, date, duration, action) {
  const employeeId = resolveEmployee(employee); // Use resolved employee ID
  const employeeTotalElement = document.getElementById(`total-${employeeId}`);
  const dayElement = document.getElementById(`${date}-${employeeId}`);

  if (employeeTotalElement && dayElement) {
    let currentTotal = parseFloat(employeeTotalElement.innerText);
    let dayTotal = parseFloat(dayElement.innerText);

    if (action === "add") {
      currentTotal += duration;
      dayTotal += duration;
    } else if (action === "subtract") {
      currentTotal -= duration;
      dayTotal -= duration;
    }

    employeeTotalElement.innerText = currentTotal.toFixed(2);
    dayElement.innerText = dayTotal.toFixed(2);
  }
}

function addMorningShiftRow() {
  shiftRowCount++;
  const table = document.getElementById('schedule-table').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();

  const positionCell = newRow.insertCell(0);
  positionCell.innerHTML = `<input type="text" value="SERVER ${shiftRowCount}">`;

  const scheduleCell = newRow.insertCell(1);
  scheduleCell.innerHTML = `
    <input type="time" id="start-time-${shiftRowCount}" onchange="calculateDuration(${shiftRowCount})">
    <input type="time" id="end-time-${shiftRowCount}" onchange="calculateDuration(${shiftRowCount})">
  `;

  const durationCell = newRow.insertCell(2);
  durationCell.id = `duration-${shiftRowCount}`;
  durationCell.innerText = "0.00";

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  days.forEach(day => {
    const cell = newRow.insertCell();
    cell.innerHTML = `<input type="text" id="${day}-${shiftRowCount}" onchange="handleEmployeeChange(this.value, '${day}', ${shiftRowCount})">`;
  });
}

function addEmployeeRow() {
  employeeRowCount++;
  const table = document.getElementById('employee-table').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  const employeeId = `new-${employeeRowCount}`;
  newRow.id = `employee-row-${employeeRowCount}`;

  const nickNameId = `nick-${employeeId}`;
  const nameId = `name-${employeeId}`;

  newRow.innerHTML = `
    <td contenteditable="true" id="${nickNameId}" onblur="updateEmployeeMap('${nickNameId}', '${nameId}')">New</td>
    <td contenteditable="true" id="${nameId}" onblur="updateEmployeeMap('${nickNameId}', '${nameId}')">First Last</td>
    <td id="total-${employeeId}">0.00</td>
    <td id="mon-${employeeId}">0.00</td>
    <td id="tue-${employeeId}">0.00</td>
    <td id="wed-${employeeId}">0.00</td>
    <td id="thu-${employeeId}">0.00</td>
    <td id="fri-${employeeId}">0.00</td>
    <td id="sat-${employeeId}">0.00</td>
    <td id="sun-${employeeId}">0.00</td>
  `;
}

function updateEmployeeMap(nickNameId, nameId) {
  const nickNameElement = document.getElementById(nickNameId);
  const nameElement = document.getElementById(nameId);

  if (nickNameElement && nameElement) {
    const nickName = nickNameElement.innerText.trim();
    const name = nameElement.innerText.trim();

    if (nickName && name) {
      employeeMap[nickName.toLowerCase()] = name.toLowerCase().replace(/\s/g, '-');
      employeeMap[name.toLowerCase()] = name.toLowerCase().replace(/\s/g, '-');  // Map full name to itself for easy lookup
    }
  }
}
