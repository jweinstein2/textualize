import {
    Slider,
    Space,
    Switch,
    Text,
    TextInput,
    Button,
    CloseButton,
} from "@mantine/core";
import {
    IconFilter,
    IconFilterFilled,
    IconX,
} from "@tabler/icons-react";
import {useState} from "react";

import classes from "./filters.module.css";

export interface Filter {
    textFilter: string;
    filterGroups: boolean;
    filterContacts: boolean;
    maxChats: number; // Evaluate last
}

interface FilterProps {
    filters: Filter;
    setFilters: (filters: Filter) => void;
    chatLength: number
}

export default function Filters(props: FilterProps) {
    const {filters, setFilters, chatLength} = props
    const [displayFilter, setDisplayFilter] = useState(false);

    return (
        <>
            <Button onClick={() => setDisplayFilter(!displayFilter)}>
                {displayFilter ? <IconFilterFilled /> : <IconFilter />}
            </Button>

            {(displayFilter) &&
                <div className={classes.filterWindow}>
                    <CloseButton
                        className={classes.close}
                        onClick={() => setDisplayFilter(false)}
                    ></CloseButton>
                    <div className={classes.filterContents}>
                        <Text fw={500}>Filters</Text>
                        <Space h="xs" />
                        <Switch
                            checked={filters.filterGroups}
                            onChange={(event) => {
                                const updated = { ...filters };
                                updated.filterGroups = event.currentTarget.checked;
                                setFilters(updated);
                            }}
                            label="Hide groups"
                            radius="lg"
                        />
                        <Switch
                            label="Hide contacts"
                            radius="lg"
                            checked={filters.filterContacts}
                            onChange={(event) => {
                                const updated = { ...filters };
                                updated.filterContacts = event.currentTarget.checked;
                                setFilters(updated);
                            }}
                        />
                        <Space h="xs" />
                        <Text fw={500} size="sm">Number of Chats</Text>
                        <Slider
                            color="blue"
                            onChange={(num) => {
                                const updated = { ...filters };
                                updated.maxChats = num;
                                setFilters(updated);
                            }}
                            min={0}
                            max={Math.min(200, chatLength)}
                            value={filters.maxChats}/>
                        <Space h="xs"/>
                        <Text fw={500} size="sm">Filter by Name</Text>
                        <TextInput
                            value={filters.textFilter}
                            onChange={(event) => {
                                const updated = { ...filters };
                                updated.textFilter = event.currentTarget.value;
                                setFilters(updated);
                            }}
                            rightSection={
                                filters.textFilter && 
                                    <IconX onClick={() => setFilters({ ...filters, textFilter: "", })}/>
                            } 
                            placeholder="Joe Shmoe"
                        />
                    </div>
                </div>}
        </>
    )
}

