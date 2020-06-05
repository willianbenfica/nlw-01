import React, { useEffect, useState, ChangeEvent, FormEvent } from  'react';
import  { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet'; 
import { Link, useHistory } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';


import "./styles.css";
import logo from '../../assets/logo.svg';



interface Item{
    id: number;
    name: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {

    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [inicialPosition, setInicialPosition] = useState<[number, number]>([0,0]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedfile] = useState<File>();

    const history = useHistory();
    
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude} = position.coords;
            setInicialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if(selectedUf === '0'){
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        });

    }, [selectedUf]);


    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value} = event.target;
        setFormData({ ...formData, [name]: value });
    }

    function handleSelecItem (id: number){

        const alreadSelected = selectedItems.findIndex(item => item === id);

        if(alreadSelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }

    }
    
    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [ latitude, longitude] = selectedPosition;
        const items = selectedItems;

        if(latitude == 0 || longitude == 0){
            alert("Selecione um ponto no mapa.");
            return;
        }

        if(items.length == 0){
            alert("Selecione um item para coleta.");
            return;
        }

        const data = new FormData();

  
            data.append('name',name);
            data.append('email',email);
            data.append('whatsapp',whatsapp);
            data.append('uf',uf); 
            data.append('city',city); 
            data.append('latitude',String(latitude));
            data.append('longitude',String(longitude));
            data.append('items',items.join(','));
            
            if(selectedFile){
                data.append('image', selectedFile);
            }


       await api.post('points', data);

       alert('Ponto de coleta Criado');

       history.push('/');


    }

    return (
        <div id="page-create-point" className="container">
            
             <header className="row w-100">
                <div className="col-md-12 text-left">
                    <img src={logo} alt="Ecoleta"/>
                    <Link to="/" className="float-right mt-2">
                            <span>
                                <FiArrowLeft /> 
                            </span>
                            <span className="d-none d-md-block">Voltar Para Home</span>
                             
                    </Link>
                </div>
            </header>
            <form onSubmit={handleSubmit} className="row w-100">
            <div className="col-md-12">
                <h1>Cadastro do ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedfile}/>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                </fieldset>

                <div className="field">
                    <label htmlFor="name">Nome da Entidade</label>
                    <input 
                        type="text"
                        name="name"
                        id="name"
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input 
                            type="email"
                            name="email"
                            id="email"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">WhatsApp</label>
                        <input 
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={inicialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                    <Marker position={selectedPosition} />
                    </Map >

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                onChange={handleSelectUf} 
                                value={selectedUf}
                                required
                            >
                                <option value="">Selecione uma UF</option>
                                {ufs.map(uf=>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select 
                                name="city" 
                                id="city"  
                                value={selectedCity} 
                                onChange={handleSelectCity}
                                required
                            >
                                <option value="">Selecione uma Cidade</option>
                                {cities.map(city =>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelecItem(item.id)} 
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>

                </fieldset>

                <button type="submit">Cadastrar Ponto de Coleta</button>
                </div>
            </form>
        </div>
    );
};

export default CreatePoint;