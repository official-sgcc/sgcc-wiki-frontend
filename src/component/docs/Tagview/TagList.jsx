import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import DocsList from "../../layout/DocsList";
import { GetDocsFromTag } from "../../util/TagCategoryAPI";

//해야하는 과업: limit과 offset 이용해서 페이지 넘기기 구현하기

export default function TagList(){

    const { tag } = useParams();

    const [docs, setDocs] = useState([]);


    useEffect(() => {

        async function load(){

            try{

                const response = await GetDocsFromTag(tag);

                setDocs(response);

            }
            catch(e){

                console.error(e);
                setDocs([]);

            }

        }


        load();

    }, [tag]);


    return (
        <div>
            <h2>
                #{tag}
            </h2>

            <DocsList
                docsdata={docs}
            />
        </div>
    );

}