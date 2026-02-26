import React, { useEffect, useState } from 'react'
import randomParfum from "../../images/parfum-now.png"
import like from "../../images/like.svg"
import x from "../../images/x.svg"
import "./Items.css"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://jzxmnsgjzppxzsrqmubn.supabase.co',
    'sb_publishable__tro5eun0RUdTuacfwF1IQ_KMSsc6gH'
);

function Items() {

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true);
    const [counter, setCounter] = useState({})


    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data);
            setLoading(false);
        };
        fetchData();
    }, []);

    console.log(products);

    function increase(id) {
        setCounter(prev => ({
            ...prev,
            [id]: (prev[id] || 1) + 1
        }))
    }
    function decrease(id) {
        setCounter(prev => ({
            ...prev,
            [id]: prev[id] > 1 ? prev[id] - 1 : 1
        }))
    }


    if (loading) return <p>Loading...</p>;
    return (
        <section className='basket'>
            <div className="container">
                <h2 className='basket__title'>Моя корзина</h2>
                <hr style={{ marginBottom: "25px" }} />
                <ul className="basket__list">
                    {
                        products.map((el) => (
                            <li key={el.id} className="basket__items">
                                <div className="basket__content">
                                    <div className="basket__photo">
                                        <img width={220} height={190} src={el.images[0]} alt={el.name} />
                                    </div>
                                    <div className="basket__inner">
                                        <p className='basket__ml'>Парфюмерная вода, спрей {el.ml} мл
                                        </p>
                                        <h3 className='basket__brand'>
                                            {el.brand}
                                        </h3>
                                        <h4 className='basket__name'>{el.title}</h4>
                                    </div>


                                </div>

                                <div className="basket__order">
                                    <div className="basket__pc">
                                        <p className="basket__how-many">Цена за 1 шт. </p>
                                        <p className='basket__money'>{el.price} {el.valute == "USD" ? "$" : "СОМ"}</p>
                                    </div>
                                    <div className="basket__count">
                                        <div className='basket__counter'>
                                            <div className="basket__inner-counter">
                                                <button onClick={() => decrease(el.id)}>-</button>
                                                <input type="number" value={counter[el.id] || 1} onChange={(e) => setCounter(prev => ({
                                                    ...prev,
                                                    [el.id]: Number(e.target.value)
                                                }))} />
                                                <button onClick={() => increase(el.id)}>+</button>
                                            </div>
                                            <div className="basket__del-or-like">
                                                <button><img src={like} alt="" /></button>
                                                <button><img src={x} alt="" /></button>
                                            </div>
                                        </div>
                                        <p className='basket__new-money'>9 000 ₽ </p>
                                    </div>
                                </div>

                            </li>
                        ))
                    }
                </ul>
            </div>
        </section>
    )
}

export default Items