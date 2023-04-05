import React from 'react'
import Title from "./Title";
import DoctorRequest from './DoctorRequest';

function DoctorInterface() {

    const doctorRequest =
        <>
            <div className='contract-container'>
                <DoctorRequest />
            </div>
        </>

    return (
        <div className='demo'>
            <Title />
            {
                doctorRequest
            }
        </div>
    )
}

export default DoctorInterface