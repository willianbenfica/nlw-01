import React from 'react';
import  { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import "./styles.css";
import logo from '../../assets/logo.svg';
import background from '../../assets/home-background.svg';

const Home = () => {
    return (
        <div id="page-home">
            <div className="content container">
                <header className="row w-100">
                    <div className="col-md-12 text-left">
                        <img src={logo} alt="Ecoleta"/>
                    </div>
                </header>

                <main className="row">
                    <div className="col-md-6">
                        <h1>Seu Marketplace de coleta de resíduos.</h1>
                        <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</p>
                        <Link to="/create-point">
                            <span>
                                <FiLogIn />
                            </span>
                            <strong>Cadastre um ponto de coleta</strong>
                        </Link>
                    </div>
                    <div className="col-md-6 d-none d-md-block">
                         <img src={background} alt="Ecoleta"/>
                    </div>
                    
                </main>

            </div>
        </div>
    )
}

export default Home;