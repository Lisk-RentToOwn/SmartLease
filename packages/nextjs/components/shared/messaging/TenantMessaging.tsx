'use client';

import TenantChat from './TenantChat';

const TenantMessageCenter = () => {

    return (
        <>      
            <div className='bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
                <div className='app-container'>
                    <TenantChat/>
                </div>
            </div>
        </>
    );
};

export default TenantMessageCenter;