let currentUserPhoneNumber;
let currentUserEmail;
let currentUserFirstName;
let currentUserLastName;

fetch('/user-information',{ method: 'GET' ,
    headers: {
        'Content-Type': 'application/json'
    }
}).then(response => {
    if (!response.ok) {
        throw new Error(`status: ${response.status}, text: ${response.statusText}`);
    }
    return response.json();
})
    .then((data) => {
        if (data.phoneNumber !== undefined && data.phoneNumber !== null) {
            currentUserPhoneNumber = data.phoneNumber;
        }
        if (data.firstName !== undefined && data.firstName !== null) {
            currentUserFirstName = data.firstName;
        }
        if (data.lastName !== undefined && data.lastName !== null) {
            currentUserLastName = data.lastName;
        }
        if (data.email !== undefined && data.email !== null) {
            currentUserEmail = data.email;
        }
    }).catch(error => {console.error(error)});
