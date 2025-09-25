import React from 'react';
import { ArrowRight, Lightbulb, Route, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: Lightbulb,
      title: "Choose Your Topic",
      description: "Tell us what you want to learn - from programming languages to business strategies, any subject you're passionate about.",
      image: "/images/sam.mckay.edna_Floating_geometric_panels_with_glowing_icons_f_cd9121b1-2415-449c-9fd6-510878bd750a_0.png"
    },
    {
      number: "02",
      icon: Route,
      title: "Your Path is Created",
      description: "Our system analyzes your goals and creates a personalized learning journey tailored specifically for your needs and objectives.",
      image: "/images/sam.mckay.edna_Circular_abstract_loop_of_arrows_where_text_vo_24773bac-3ac6-4957-b42f-bc404a5eb4d1_1.png"
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Learn & Progress",
      description: "Learn with voice, text, and imagery all in one space. Everything is carefully curated but fully customizable for your unique learning style.",
      image: "/images/sam.mckay.edna_Abstract_explosion_of_light_beams_turning_into_ae0bc824-7571-4682-8f82-3f6faa6c1865_3.png"
    }
  ];

  return (
    <div className="py-32 px-6 bg-gradient-to-b from-white via-[#6654f5]/5 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6654f5]/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ca5a8b]/10 rounded-full filter blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg mb-6">
            <Route className="w-4 h-4 text-[#6654f5]" />
            <span className="text-sm font-medium text-[#6654f5]">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-xl text-[#0b0c18]/70 max-w-3xl mx-auto font-light">
            Get started in minutes with our intuitive three-step process
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-6xl font-bold text-[#6654f5]/20">{step.number}</div>
                  <div className="inline-flex p-3 rounded-2xl brand-gradient">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-[#0b0c18]">{step.title}</h3>
                <p className="text-lg text-[#0b0c18]/70 font-light leading-relaxed mb-6">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="flex items-center gap-2 text-[#6654f5] font-medium">
                    <span>Next step</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <img
                  src={step.image}
                  alt={step.title}
                  className="rounded-3xl shadow-2xl w-full"
                />
                <div className="absolute inset-0 rounded-3xl brand-gradient-light" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;

