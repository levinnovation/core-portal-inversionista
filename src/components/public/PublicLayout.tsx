import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { PublicNav } from "./PublicNav";
import { PublicFooter } from "./PublicFooter";
import { LeadDialogProvider } from "./LeadDialog";

export const useSeo = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;
    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector(selector) as HTMLElement | null;
      if (!el) {
        el = document.createElement(selector.startsWith("link") ? "link" : "meta");
        if (selector.includes("property=")) el.setAttribute("property", selector.split('"')[1]);
        else if (selector.includes("name=")) el.setAttribute("name", selector.split('"')[1]);
        else if (selector.startsWith("link")) el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };
    set('meta[name="description"]', "content", description);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", description);
    set('link[rel="canonical"]', "href", window.location.href);
  }, [title, description]);
};

export const PublicLayout = () => {
  const loc = useLocation();

  useEffect(() => {
    if (!loc.hash) window.scrollTo({ top: 0 });
  }, [loc.pathname, loc.hash]);

  return (
    <LeadDialogProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <PublicNav />
        <main className="flex-1">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </LeadDialogProvider>
  );
};
