import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from "react-toastify"
import axios from "axios"

const Orders = ({ url }) => {

    const [orders, setOrders] = useState([]);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchAllOrders = async () => {
        const response = await axios.get(url + "/api/order/list");
        if (response.data.success) {
            setOrders([...response.data.data].reverse());
            console.log(response.data.data);
        }
        else {
            toast.error("Error")
        }
    }

    useEffect(() => {
        fetchAllOrders();
        // eslint-disable-next-line
    }, [])

    const formatName = (address) => {
        if (!address) return '';
        const first = address.first_name || address.firstName || address.first || '';
        const last = address.last_name || address.lastName || address.last || '';
        return (first + ' ' + last).trim();
    }

    const statusHandler = async (e, orderId) => {
        const newStatus = e.target.value;
        setUpdatingOrderId(orderId);
        try {
            const { data } = await axios.post(url + "/api/order/status", { orderId, status: newStatus });
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
                toast.success("Order status updated");
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setUpdatingOrderId(null);
        }
    }

    return (
        <div className='admin-orders' style={{ padding: 16 }}>
            <h2>All Orders ({orders.length})</h2>

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className='orders-table-wrap'>
                    <table className='orders-table'>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td className='orders-date'>{new Date(order.date).toLocaleString()}</td>
                                    <td className='orders-customer'>{formatName(order.address) || order.address?.email || '—'}</td>
                                    <td className='orders-items'>{(order.items || []).map((it) => `${it.name} x ${it.quantity}`).join(', ')}</td>
                                    <td className='orders-amount'>${order.amount}.00</td>
                                    <td className={order.payment ? 'paid' : 'not-paid'}>{order.payment ? 'Paid' : 'Not Paid'}</td>
                                    <td className='orders-status'>
                                        <select value={order.status} onChange={(e) => statusHandler(e, order._id)} disabled={updatingOrderId === order._id}>
                                            <option>Food Processing</option>
                                            <option>Order Placed</option>
                                            <option>Packing</option>
                                            <option>Shipped</option>
                                            <option>Out for delivery</option>
                                            <option>Delivered</option>
                                        </select>
                                    </td> 
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Orders