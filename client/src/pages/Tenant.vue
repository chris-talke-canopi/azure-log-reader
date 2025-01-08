<template>
    <div id="layout">
        <div id="menu">
            <div class="bg-white bg-clip-border drop-shadow-xl border p-4 constrain mb-4">
                <h3 class="text-xs text-gray-700 bg-gray-50 font-medium pb-4">
                    Filters
                </h3>
                <div class="flex flex-col mb-2">
                    <label class="text-xs text-gray-700 font-light" for="start_date">Start Date (Local)</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="datetime-local" v-model.lazy="startDate" name="start_date" id="start_date">
                </div>
                <div class="flex flex-col">
                    <label class="text-xs text-gray-700 font-light" for="end_date">End Date (Local)</label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="datetime-local" @change="updateTime" :value="endDate" name="end_date" id="end_date">
                </div>
                <button @click="search" class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded w-full mt-4">
                    Search
                </button>
            </div>

            <div class="bg-white bg-clip-border drop-shadow-xl border p-4 constrain mb-4">
                <h3 class="text-xs text-gray-700 bg-gray-50 font-medium pb-4 flex flex-row justify-between">
                    <span>Functions (Last 28 Days)</span>
                    <div>
                        <a @click="fillOperationNames" class="underline font-normal text-blue-700 cursor-pointer">Select All</a>
                        <a @click="clearOperationNames" class="ml-2 underline font-normal text-blue-700 cursor-pointer">Clear All</a>
                    </div>
                </h3>
                <ul>
                    <li v-for="operations in operationNames" :key="operations" class="text-sm">
                        <input type="checkbox" class="cursor-pointer" :value="operations" v-model="selectedOperationNames"/>
                        <span class="ml-2"> 
                            {{ operations }}
                        </span>
                    </li>
                </ul>
                <button @click="search" class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded w-full mt-4">
                    Apply
                </button>
            </div>

            <div class="bg-white bg-clip-border drop-shadow-xl border p-4 constrain">
                <h3 class="text-xs text-gray-700 bg-gray-50 font-medium flex flex-row justify-between">
                    <span>Share View</span>
                    <div>
                    </div>
                </h3>
                <button @click="shareLink" class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded w-full mt-4">
                    Copy Link
                </button>
            </div>
        </div>

        <div id="main" >
            <section class="bg-white bg-clip-border drop-shadow-xl border">
                <table class="w-full text-sm text-left text-gray-500">
                    <thead class="text-xs text-gray-700 bg-gray-50">
                        <tr>
                            <th scope="col" class="px-4 py-3 w-fit">Function Name</th>
                            <th scope="col" class="px-4 py-3 w-fit">Operation Id</th>
                            <th scope="col" class="px-4 py-3 w-fit">Metadata</th>
                            <th scope="col" class="px-4 py-3 w-fit">Counts</th>
                            <th scope="col" class="px-4 py-3 w-fit">Timestamp (Local Time)</th>
                        </tr>
                    </thead>
                    <tbody v-if="operationIds && operationIds.tables">
                        <tr class="border-b text-sm/[12px]" v-for="row in operationIds.tables[0].rows" :key="row[1]">
                            <td class="px-4 py-3 w-fit">{{ row[0] }}</td>
                            <td class="px-4 py-3 w-fit">
                                <RouterLink class="underline text-blue-700" :to="`/tenant/${route.params.tenantId}/${row[1]}`">{{ row[1] }}</RouterLink>
                            </td>
                            <td class="px-4 py-3 w-fit">
                                <span v-if="row[2]" class="bg-gray-300 p-1 px-2 rounded-md text-gray-700 text-sm/[9px]">
                                    email : {{ row[2] }}
                                </span>
                            </td>
                            <td class="px-4 py-3 w-fit">
                                <span v-if="row[3]" class="bg-amber-200 ms-2 p-1 px-2 rounded-md text-amber-800 text-sm/[9px]">
                                    actions : {{ row[3] }}
                                </span>
                                <span v-if="row[4]" class="bg-red-200 ms-2 p-1 px-2 rounded-md text-red-800 text-sm/[9px]">
                                    errors : {{ row[4] }}
                                </span>
                                <span v-if="row[5]" class="bg-blue-200 ms-2 p-1 px-2 rounded-md text-blue-800 text-sm/[9px]">
                                    updated : {{ row[5] }}
                                </span>
                            </td>
                            <td class="px-4 py-3 w-fit uppercase">{{ new Date(row[6]).toLocaleDateString() }} @ {{ new Date(row[6]).toLocaleTimeString() }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>
            <div v-if="operationIds && operationIds.tables" class="flex flex-row justify-end p-4 text-xs">
                {{ operationIds.tables[0].rows.length }} Reports
            </div>
        </div>

        <aside id="sandwhich">
            <CreateTenant />
        </aside>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

import { AzureLogResponse } from '../../../server/src/controllers/azure/applicationInsights';
import { api } from '../api';
import { getStartOfDay } from '../utils/helpers';
import CreateTenant from '../components/CreateTenant.vue';

const route = useRoute();

const props = defineProps({
    setIsLoading: {
        type: Function,
    }
})

// Defaults
let defaultDate = getStartOfDay(new Date());
const localDateString = defaultDate.toLocaleDateString('en-CA');
const localTimeString = '00:00'

const selectedOperationNames = ref([] as string[]);
const operationNames = ref([] as string[]);
const operationIds = ref([] as AzureLogResponse[]);

const startDate = ref(`${localDateString}T${localTimeString}` as undefined | string);
const endDate = ref(undefined as undefined | string);

interface CachedDefaults {
    selectedOperationNames: string[]
    startDate: string
    endDate: string
}

onMounted(async function() {
    props.setIsLoading(true);
    const tenantId = route.params.tenantId as string;

    let cachedData = window.localStorage.getItem(`search_defaults__${tenantId}`) as string | CachedDefaults;
    if (cachedData && typeof cachedData === 'string') {
        cachedData = JSON.parse(cachedData);
    }

    let start_date_filter = undefined;
    if (route.query.start_date_filter) {
        start_date_filter = route.query.start_date_filter;
        if (start_date_filter.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            startDate.value = start_date_filter;
        }
    }

    let end_date_filter = undefined;
    if (route.query.end_date_filter) {
        end_date_filter = end_date_filter;
        if (end_date_filter.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
            endDate.value = end_date_filter;
        }
    }

    let operations_filter = [];
    if (route.query.operation_filter) {
        operations_filter = JSON.parse(route.query.operation_filter as string);
    }

    const operationNamesRes = await api.getOperationNames(tenantId, undefined, undefined);
    if (operationNamesRes) {
        operationNames.value = operationNamesRes;
        if (cachedData) {
            if (Array.isArray(operations_filter) && operations_filter.length > 0) {
                selectedOperationNames.value = operations_filter;
            } else {   
                selectedOperationNames.value = typeof cachedData !== 'string' ? cachedData.selectedOperationNames : [];
            }
        } 
        
        else {
            selectedOperationNames.value = operationNamesRes;
        }
    }
    
    const operationIdRes = await api.getOperationIds(tenantId, startDate.value, endDate.value, selectedOperationNames.value);
    if (operationIdRes) {
        operationIds.value = operationIdRes;
    }

    props.setIsLoading(false);
})

function clearOperationNames() {
    selectedOperationNames.value = [];
}

function fillOperationNames() {
    selectedOperationNames.value = operationNames.value;
}

async function search() {
    const tenantId = route.params.tenantId as string;
    const operationIdRes = await api.getOperationIds(tenantId, startDate.value, endDate.value, selectedOperationNames.value);
    if (operationIdRes) {
        operationIds.value = operationIdRes;
    }

    window.localStorage.setItem(`search_defaults__${tenantId}`, JSON.stringify({
        selectedOperationNames: selectedOperationNames.value,
        startDate: startDate.value,
        endDate: endDate.value
    }));
}

const updateTime = (event) => {
  const value = event.target.value;
  let date = new Date(value)

  if (value && endDate.value === undefined) {
    endDate.value = `${date.toLocaleDateString('en-CA')}T00:00`;
    return;
  } 
  
  else {
    endDate.value = date.toISOString().slice(0, 16);
    return;
  }
};

function shareLink() {
    const tenantId = route.params.tenantId as string;

    const params_obj = {} as any;

    startDate.value ? params_obj.start_date_filter = startDate.value : null;
    endDate.value ? params_obj.end_date_filter = endDate.value : null;
    selectedOperationNames.value ? params_obj.operation_filter = JSON.stringify(selectedOperationNames.value) : null;

    const params = new URLSearchParams(params_obj);

    const link = `${window.location.origin}/tenant/${tenantId}?${params.toString()}`;

    navigator.clipboard.writeText(link).then(() => {
        alert("Link copied to clipboard!");
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}
</script>

<style scoped>
#layout {
    display: grid;
    grid-template-columns: 400px 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 16px;
    grid-row-gap: 8px;
    margin: 8px 16px;
}

#menu {
    grid-area: 1 / 1 / 2 / 2;
}

#main {
    grid-area: 1 / 2 / 2 / 3;
}

.constrain {
    height: max-content;
}

aside {
    
}
</style>