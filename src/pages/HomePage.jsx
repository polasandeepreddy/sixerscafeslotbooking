import React from 'react';
import { Clock, Calendar, CreditCard } from 'lucide-react';

// Facility data as plain objects — no interface
const facilities = [
  {
    imgSrc: '/images/facility1.jpg',
    alt: 'Indoor cricket net',
    title: 'Indoor Nets',
  },
  {
    imgSrc: '/images/facility2.jpg',
    alt: 'LED night lights',
    title: 'Night Lights',
  },
  {
    imgSrc: '/images/facility3.jpg',
    alt: 'Secure parking',
    title: 'Parking Area',
  },
];

const HomePage = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Cricket Box</h1>

      <section className="grid md:grid-cols-3 gap-4">
        {facilities.map((facility, index) => (
          <div key={index} className="border rounded-xl shadow p-4 text-center">
            <img
              src={facility.imgSrc}
              alt={facility.alt}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h3 className="text-xl font-semibold">{facility.title}</h3>
          </div>
        ))}
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-6 text-center">
        <div className="p-4 border rounded-lg shadow">
          <Clock className="mx-auto mb-2" size={32} />
          <h4 className="text-lg font-medium">Flexible Timings</h4>
          <p>Book slots anytime between 6 AM and 5 AM.</p>
        </div>
        <div className="p-4 border rounded-lg shadow">
          <Calendar className="mx-auto mb-2" size={32} />
          <h4 className="text-lg font-medium">Easy Booking</h4>
          <p>Pick your date and time easily from our calendar.</p>
        </div>
        <div className="p-4 border rounded-lg shadow">
          <CreditCard className="mx-auto mb-2" size={32} />
          <h4 className="text-lg font-medium">Simple Payments</h4>
          <p>Pay with QR and upload proof for confirmation.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
