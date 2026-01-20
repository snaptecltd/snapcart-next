"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import CardType1 from "@/components/card/Type1";
import { getStoreLocations } from "@/lib/api/global.service";

export default function StoreLists() {
  const [locations, setLocations] = useState([]);

  const { data } = useSWR("store-locations", getStoreLocations, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (data?.locations) {
      setLocations(data.locations);
    }
  }, [data]);

  return (
    <div className="row mt-4">
      <div className="col-12 col-md-3">
        {locations.map((location) => (
          <CardType1
            key={location.id}
            title={location.store_name}
            location={location.address}
            offDay={location.off_day}
            phone={location.contact_number}
            image={location.full_url?.path || "/placeholder/image.jpg"}
            mapUrl="#"
            slug={location.slug}
          />
        ))}
      </div>
    </div>
  );
}
