import React from 'react';

export const FeaturesSection = () => {
  const features = [
    {
      image: "/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_1.png",
      title: "AI-Powered Personalization",
      description: "Our intelligent system learns your unique learning style and adapts content delivery for maximum retention."
    },
    {
      image: "/images/sam.mckay.edna_Circular_abstract_loop_of_arrows_where_text_vo_24773bac-3ac6-4957-b42f-bc404a5eb4d1_1.png",
      title: "Goal-Oriented Learning",
      description: "Set clear objectives and track your progress with measurable milestones and achievements."
    },
    {
      image: "/images/sam.mckay.edna_Abstract_streams_of_glowing_lines_flowing_into_0943014d-588f-4ae4-bf32-7e8902c72d77_0.png",
      title: "Accelerated Progress",
      description: "Learn 3x faster with optimized content sequencing and spaced repetition techniques."
    },
    {
      image: "/images/sam.mckay.edna_Network_of_nodes_connected_by_glowing_lines_ea_1fa62e10-cb69-40e5-bb59-618e8919caf8_2.png",
      title: "Community Support",
      description: "Connect with peers, mentors, and experts in your field for collaborative learning."
    },
    {
      image: "/images/sam.mckay.edna_Floating_geometric_panels_with_glowing_icons_f_cd9121b1-2415-449c-9fd6-510878bd750a_0.png",
      title: "Progress Analytics",
      description: "Detailed insights into your learning patterns help you optimize your study sessions."
    },
    {
      image: "/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_3.png",
      title: "Certified Learning",
      description: "Earn verifiable certificates and badges to showcase your achievements."
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#6654f5] rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ca5a8b] rounded-full filter blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-[#0b0c18]">Why Choose</span>{' '}
            <span className="text-gradient">LearnFlow?</span>
          </h2>
          <p className="text-xl text-[#0b0c18]/70 max-w-3xl mx-auto">
            Experience the future of education with our cutting-edge learning platform
            designed to transform how you acquire and master new skills.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            return (
              <div
                key={index}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 brand-gradient-light rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-6 shadow-lg bg-white">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#0b0c18] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#0b0c18]/70 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 brand-gradient transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
              </div>
            );
          })}
        </div>

        {/* Stats section */}
        <div className="mt-20 p-8 brand-gradient rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-white/80">Completion Rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">3x</div>
              <div className="text-white/80">Faster Learning</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-white/80">Active Users</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.9</div>
              <div className="text-white/80">User Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;