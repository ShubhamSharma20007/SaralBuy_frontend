const Brands = () => {
  return (
    <div className="relative px-8 sm:px-16  min-h-42 flex items-center z-0 overflow-hidden">
      
      <img src="brand-grid.png" className="w-full absolute top-10 left-0"/>

      {/* Content */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full max-w-7xl mx-auto px-4 gap-6 relative z-10">
        {/* Title */}
        <p className="font-bold text-3xl whitespace-nowrap sm:text-4xl text-orange-600 border-l-4 border-orange-600 pl-3 tracking-tight">
          Brands for you
        </p>

        {/* Images Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 w-full">
          <img src="ultraTech.png" alt="" className="h-16 mx-auto sm:mx-0" />
          <img src="33f1edcb48c8ecdd40f3bf755d0ea403588b76a6.png" alt="" className="h-16 mx-auto sm:mx-0" />
          <img src="b811f048dd40b278d13b66b5285b79be5fb6d948.png" alt="" className="h-16 mx-auto sm:mx-0" />
          <img src="5be2e51feb4beddfb8181168115e9ac543279ccd.png" alt="" className="h-20 mx-auto sm:mx-0" />
          <img src="dabb1431d07bda80a45105929ce8e306e13d421b.png" alt="" className="h-16 mx-auto sm:mx-0" />
          <img src="6bab3bfb15fd4ca5b298053c9fc900e884206544.png" alt="" className="h-16 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
  );
};

export default Brands;
