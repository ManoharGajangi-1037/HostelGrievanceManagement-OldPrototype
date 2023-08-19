document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const hostel = params.get('hostel');
    const wing = params.get('wing');
    console.log('Hostel:', hostel);
    console.log('Wing:', wing);
    fetchGrievances(hostel);
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutBtn');
    logoutButton.addEventListener('click', handleLogout);
  });
  
  function handleLogout(event) {
    event.preventDefault();
    window.location.href = '/index.html';
  }
  
  function fetchGrievances(hostel) {
    const url = `/grievances?hostel=${encodeURIComponent(hostel)}`;
    fetch(url)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch grievances');
        }
      })
      .then((grievances) => {
        const grievancesBody = document.getElementById('grievancesBody');
        grievancesBody.innerHTML = '';
        console.log(grievances);
        grievances.forEach((grievance) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${grievance.Id}</td>
            <td>${grievance.Name}</td>
            <td>${grievance.Hostel}</td>
            <td>${grievance.Wing}</td>
            <td>${grievance.Issue}</td>
            <td>${grievance.Description}</td>
            <td>
              <select class="status-select" data-grievance-id="${grievance._id}">
                <option value="Pending" ${grievance.Status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Accepted" ${grievance.Status === 'Accepted' ? 'selected' : ''}>Accepted</option>
              </select>
            </td>
          `;
          grievancesBody.appendChild(row);
        });
  
        // Add event listener to status selects
        const statusSelects = document.querySelectorAll('.status-select');
        statusSelects.forEach((select) => {
          select.addEventListener('change', handleStatusChange);
        });
      })
      .catch((error) => {
        console.error('Error retrieving grievances:', error);
      });
  }
  
  function handleStatusChange(event) {
    const grievanceId = event.target.dataset.grievanceId;
    const newStatus = event.target.value;
  
    const requestBody = {
      status: newStatus
    };
  
    fetch(`/grievances/${grievanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then((response) => {
        if (response.ok) {
          console.log('Grievance status updated successfully');
        } else {
          console.log('Failed to update grievance status');
        }
      })
      .catch((error) => {
        console.error('Error during grievance status update:', error);
      });
  }
  