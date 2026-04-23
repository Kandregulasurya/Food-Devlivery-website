import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {

    const { url, token } = useContext(StoreContext);
    const [data, setData] = useState([]);
    const [loadingOrderId, setLoadingOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
        setData(response.data.data);
        console.log(response.data.data);

    }

    const trackOrder = async (orderId) => {
        // toggle off
        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder(null);
            return;
        }
        try {
            setLoadingOrderId(orderId);
            const res = await axios.get(url + `/api/order/${orderId}`, { headers: { token } });
            if (res.data.success) {
                setSelectedOrder(res.data.data);
            } else {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error(error);
            setSelectedOrder(null);
        } finally {
            setLoadingOrderId(null);
        }
    }

    useEffect(() => {
        if (token) {
            fetchOrders();
        }
    }, [token])

    return (
        <div className='my-orders'>
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order) => {
                    return (
                        <div key={order._id} className='my-orders-order'>
                            <img src={assets.parcel_icon} alt="" />
                            <p>{(order.items || []).map((item, itemIndex) => {
                                if (itemIndex === (order.items || []).length - 1) {
                                    return item.name + " x " + item.quantity
                                }
                                else {
                                    return item.name + " x " + item.quantity + " , "
                                }
                            })}</p>
                            <p>${order.amount}.00</p>
                            <p>Items:{(order.items || []).length}</p>
                            <p><span>&#x25cf;</span><b>{order.status}</b></p>
                            <button onClick={() => trackOrder(order._id)} className='border px-4 py-2 text-sm font-medium rounded-sm'>
                                {loadingOrderId === order._id ? 'Loading...' : (selectedOrder && selectedOrder._id === order._id ? 'Hide' : 'Track Order')}
                            </button>

                            {selectedOrder && selectedOrder._id === order._id && (
                                <div className='track-details mt-3 p-3 border rounded'>
                                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                                    <p><strong>Payment:</strong> {selectedOrder.payment ? 'Paid' : 'Not Paid'}</p>
                                    <p><strong>Method:</strong> {selectedOrder.paymentMethod || '—'}</p>
                                    <p><strong>Address:</strong> {selectedOrder.address?.street}, {selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}</p>
                                    <div className='mt-2'>
                                        <strong>Items:</strong>
                                        <ul className='list-disc list-inside mt-1'>
                                            {(selectedOrder.items || []).map(it => (
                                                <li key={it._id || it.name}>{it.name} x {it.quantity} {it.size ? `(${it.size})` : ''}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

        </div>
    )
}

export default MyOrders