

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './ProductDetails.css';

const supabase = createClient(
    'https://jzxmnsgjzppxzsrqmubn.supabase.co',
    'sb_publishable__tro5eun0RUdTuacfwF1IQ_KMSsc6gH'
);

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data) setProduct(data);
            setLoading(false);
        };
        fetchProduct();
    }, [id]);


    if (loading) return <div className="loader">Yuklanmoqda...</div>;
    if (!product) return <div>Mahsulot topilmadi.</div>;

    return (
        <div className="detail-container">
            <nav className="breadcrumbs">
                <Link to="/">Главная</Link> / <span>Новинки</span> / <span>{product.brand}</span>
            </nav>

            <div className="detail-grid">
                <div className="image-section">
                    <img src={product.images[0]} alt={product.name} className="main-img" />
                </div>

                <div className="info-section">
                    <p className="category-label">Парфюмерная вода, спрей 30 мл</p>
                    <h1 className="detail-title">
                        <span className="brand-name">{product.brand?.toUpperCase()}</span> {product.name}
                    </h1>

                    <div className="rating">
                        <span className="stars">★★★★★</span>
                        <span className="score">5.0</span>
                        <span className="artikul">артикул: {product.id.slice(0, 8)}</span>
                    </div>

                    <div className="price-section">
                        <span className="current-price">{product.price?.toLocaleString()} ₽</span>
                        <span className="old-price">{(product.price + 2000).toLocaleString()} ₽</span>
                    </div>

                    <div className="actions-det">
                        <button className="add-to-cart">Добавить в корзину</button>
                        <button className="wishlist-btn">♡</button>
                    </div>

                    <div className="detail-tabs">
                        <button>Описание</button>
                        <button className="active">Характеристики</button>
                        <button>О бренде</button>
                    </div>

                    <div className="specs-list">
                        <div className="spec-item"><span>тип продукта</span> <span>парфюмерная вода</span></div>
                        <div className="spec-item"><span>для кого</span> <span>женский</span></div>
                        <div className="spec-item"><span>страна бренда</span> <span>{product.country || 'Италия'}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
