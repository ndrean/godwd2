import React, { useState} from 'react';

export default function Kiters(){
    const [users, setUsers] = useState('')
    const [events, setEvents] = userState('')

    function handleUsers(){
        try{
            const responseUsers = await fetch(usersEndPoint);
            const dataUsers = await responseUsers.json();
            if (dataUsers) {
                setUsers(dataUsers);
            }
        } catch (err) {
        throw new Error(err);
        }
    }

    function handleEvents(){
        try{
            const responseEvents = await fetch(eventsEndPoint);
            const dataEvents = await responseEvents.json();
            if (dataEvents) {
                setEvents(dataEvents);
            }
        } catch (err) {
        throw new Error(err);
        }
    }


    return(

    )
}
