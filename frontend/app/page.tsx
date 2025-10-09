"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";
import heroImage from "@/assets/hero-abstract.jpg";
import { useSession } from "@/lib/client";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-primary">
              Connect, Chat, Collaborate
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience seamless communication with our modern chat platform.
              Stay connected with your team, anywhere, anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={!useSession().data ? "/sign-in" : "/chat"}>
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Get Started
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/chat_demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto cursor-pointer"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16">
            Why Choose Our Platform
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Real-time Messaging"
              description="Instant message delivery with typing indicators and read receipts."
            />

            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Team Collaboration"
              description="Create channels, share files, and work together seamlessly."
            />

            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Secure & Private"
              description="End-to-end encryption keeps your conversations safe and private."
            />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-12 lg:p-16 text-center max-w-4xl mx-auto shadow-glow">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg lg:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using our platform to stay
              connected.
            </p>
            <Link href={!useSession().data ? "/sign-in" : "/chat"}>
              <Button
                variant="outline"
                size="lg"
                className="bg-card text-card-foreground hover:bg-card/90 border-0 cursor-pointer"
              >
                Start Chatting Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-card rounded-xl p-8 shadow-subtle hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
      <div className="bg-primary rounded-lg w-16 h-16 flex items-center justify-center mb-4 text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-card-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
