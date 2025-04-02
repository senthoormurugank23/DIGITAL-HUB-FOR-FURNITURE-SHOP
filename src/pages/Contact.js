import React from "react";
import Layout from "../components/Layout/Layout";
import "../styles/Contact.css"; // Updated path

const Contact = () => {
  return (
    <Layout title={"Contact"}>
      <div className="contact-container">
        <h1 className="contact-title">Contact Us</h1>
        <div className="contact-details">
          <div className="contact-info">
            <h3>Sri Angala Parameshwari Industries and Furniture</h3>
            <p>
              <strong>Owner:</strong> Ezhil Kumar C
            </p>
            <p>
              <strong>Phone:</strong> 90037 51896, 99409 88264
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:sriangalaparameswari2003@gmail.com">
                sriangalaparameswari2003@gmail.com
              </a>
            </p>
            <p>
              <strong>Address:</strong> NSK 1st Cross Street, Bharathiyar Road,
              Madurai – 625011
            </p>
          </div>
          {/* <div className="contact-form">
            <h3>Get in Touch</h3>
            <form>
              <input
                type="text"
                placeholder="Your Name"
                className="input-field"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="input-field"
              />
              <textarea
                placeholder="Your Message"
                className="textarea-field"
              ></textarea>
              <button type="submit" className="submit-button">
                Send Message
              </button>
            </form>
          </div> */}
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
