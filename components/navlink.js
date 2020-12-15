import Link from 'next/link';

export default function NavLink(props){

    return (
        <Link href={props.url}>
        <a className="nl">
            {props.text}
        </a>
        </Link>
    );
}
