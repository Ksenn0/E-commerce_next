'use client'

import Link from "next/link"
import { useCart } from "@/context/CartContext"

export default function Header(){
    const {itemCount} = useCart();
    
    return(
       <header className="bg-primary-rose text-dark p-4 shadow-md">
           <div className="container mx-auto flex justify-between items-center">
           <Link href="/" className="text-2xl font-bold">
           Roze Magazine
           </Link>
           <nav>
               <Link href="/carrinho" className="bg-accent-gold text-cream px-4 py-2 rounded hover:bg-accent-mauve">
               carrinho({itemCount})
               </Link>
           </nav>
           </div>
       </header>
   );
}