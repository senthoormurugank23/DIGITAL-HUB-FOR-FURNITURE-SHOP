import React from "react";
import Layout from "../components/Layout/Layout";
import aboutBg from "./aboutback.jpg"; // Import your background image
import aboutImage from "./About.png"; // Import your about image
import "../styles/about.css"; // Import the CSS file

const About = () => {
  return (
    <Layout title={"About us our shop"}>
      {/* About Us Section */}
      <section
        className="about-us"
        style={{ backgroundImage: `url(${aboutBg})` }}
      >
        <div className="about-container">
          <div className="about-image">
            <img src={aboutImage} alt="About Us" />
          </div>
          <div className="about-content">
            <h2>About Us</h2>
            <p>
              Our mission is to bring you high-quality furniture that not only
              looks great but also feels great. We believe that furniture
              shopping should be a delightful experience, which is why we make
              it easy for you to find the perfect piece for your space.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
