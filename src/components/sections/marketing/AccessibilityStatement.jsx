import React from "react";
import { safeParse } from "@/utils/safeParse";

export default function LegalContent({ data, title }) {
  if (!data || !data?.legal_content?.length) return null;

  return (
    <section
      className={`common-content-wrapper white relative overflow-hidden${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="bg-white benefits-wrapper-info relative rounded-10">
        <div className="container-fluid-lg z-1">
          <div className="max-lg:py-50 lg:py-80 w-full">
            {data.legal_content.map((block, index) => (
              <div
                key={index}
                className={`w-full${index < data.legal_content.length - 1 ? " mb-50 last:mb-0" : ""}`}
              >
                {block?.heading && (
                  <div className="title-black mb-20">
                    <h2 className="text-black-800">{safeParse(block.heading)}</h2>
                  </div>
                )}
                {block?.legal_info?.map((info, infoIndex) => (
                  <div
                    key={infoIndex}
                    className={`w-full${index < data.legal_content.length - 1 ? " mb-30 last:mb-0" : ""}`}
                  >
                    {info?.title && (
                      <div className="title-black mb-10">
                        <h3 className="text-black-800">{safeParse(info.title)}</h3>
                      </div>
                    )}
                    {info?.description && (
                      <div className="content global-list black">{safeParse(info.description)}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
