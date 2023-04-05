import React from 'react'
import Title from './Title'
import InsurerView from './InsurerView'

function index() {

    const insurerView =
        <>
            <div className='contract-container'>
                <InsurerView />
            </div>
        </>

    return (
        <div className='demo'>
            <Title />
            {
                insurerView
            }
        </div>
    )
}

export default index