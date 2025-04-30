import {Customer} from './customer.js';
export async function getUserInfo(){
    let customer;
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
            customer = Customer.fromJSON(data);
        }).catch(error => {console.error(error)});
    return customer;
}