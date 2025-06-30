import React, { useState } from 'react'
import './change.css'
import bitxchain from '../../assets/icon2.png'

const ChangePassword = () => {
    const [Show, setShow] = useState('password');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [hideshowtext, setHideshowtext] = useState('show');

    const handle_show = () =>{
        if(Show == 'password'){
            setShow('text');
            setHideshowtext('hide');
        }else{
            setShow('password');
            setHideshowtext('show');

        }
    }
    const handle_confirm = () =>{
        if(password == confirm){
            alert("Confirmed Login")
        }else{
            alert("make sure the passwords are thesame")
        }
    }

    return (
        <div className='change-container'>
            <div className="holder-card">
                <img src={bitxchain} alt="bitxchain" width={100} />
                <h2 style={{
                    fontSize: 34,
                }}> Change Password </h2>
                <div className="card">
                    <div className="card-top" style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        gap: 10,
                        paddingTop: 20,
                        paddingBottom: 20,
                    }}>
                        <label htmlFor="email">NewPassword</label>
                        <input
                            type={Show}
                            value={password}                            
                            name="password"
                            id=""
                            onChange={(e)=>{setPassword(e.target.value)}}
                            className='change-input' />
                    </div>
                    <div className="card-top" style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        gap: 10,
                        paddingTop: 20,
                        paddingBottom: 20,
                    }}>
                        <label htmlFor="email">Confirm Password</label>
                        <div className="inner-input-card">
                            <input
                            type={Show}
                            value={confirm}
                            name="confirm"
                            id=""
                            onChange={(e) => {setConfirm(e.target.value)} }
                            className='change-input' />
                            <button className='show-hide' onClick={handle_show}>
                                {hideshowtext}
                            </button>
                        </div>
                    </div>
                    <div className="change-card-bottom">
                        <button type="button" className='change-card-btn' onClick={handle_confirm}>Recover</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword
