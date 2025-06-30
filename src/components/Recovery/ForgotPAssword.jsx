import React from 'react'
import './forgot.css'

const ForgotPAssword = () => {
    const [userEmail, setUseremail] = ('');
    return (
        <div className='forgot-container'>
            <div className="holder-card">
                <h2 style={{
                    fontSize:34,
                }}>Forgot Password</h2>
                <div className="card">
                    <div className="card-top" style={{
                        display:'flex',
                        justifyContent:'flex-start',
                        flexDirection:'column',
                        gap: 10,
                        paddingTop:20,
                        paddingBottom:20,
                    }}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        value={userEmail}
                        name="email"
                        id=""
                        onChange={(e) => setUseremail(e.target.value)}
                        className='forget-input'/>
                        </div>
                        <div className="card-bottom">
                            <button type="button" className='card-btn'>Recover</button>
                        </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPAssword