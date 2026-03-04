import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, Sparkles } from "lucide-react";
import { Button } from "./button";

function Hero({ children }: { children?: React.ReactNode }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["incroyable", "nouveau", "innovant", "rentable", "intelligent"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4 rounded-full px-4 text-xs font-medium bg-neutral-800 text-white hover:bg-neutral-700">
              AI cofounder <Sparkles className="w-3 h-3 text-amber-400" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-4xl md:text-6xl max-w-3xl tracking-tight text-center font-bold text-neutral-900 leading-[1.1]">
              <span className="block mb-2">Créez quelque chose de</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1 text-blue-600">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-bold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-neutral-500 max-w-2xl text-center mt-4">
              Recherchez, validez et construisez votre produit avec l'IA. De l'idée à l'exécution, votre co-fondateur virtuel vous accompagne à chaque étape.
            </p>
          </div>
          <div className="flex flex-row gap-3 mt-6 w-full max-w-3xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
