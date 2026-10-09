import { headingCase } from "@/lib/heading-case";
export default function PageToolbar({ title, description, children }) {
  return <header className="page-toolbar"><div><h1>{headingCase(title)}</h1>{description && <p>{description}</p>}</div>{children && <div className="page-toolbar-actions">{children}</div>}</header>;
}
