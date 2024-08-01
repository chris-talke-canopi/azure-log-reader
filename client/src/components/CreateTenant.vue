<template>
    <div class="bg-white bg-clip-border drop-shadow-xl border p-4 constrain mb-4">
        <h3 class="text-xs text-gray-700 bg-gray-50 font-medium pb-4">
            {{ editing ? 'Edit Tenant' : 'Add New Tenant' }} 
        </h3>
        <div class="flex flex-col mb-2">
            <label class="text-xs text-gray-700 font-light" for="name">Name</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model.lazy="name" name="name" id="name">
        </div>
        <div class="flex flex-col mb-2">
            <label class="text-xs text-gray-700 font-light" for="tenant_version">Version</label>
            <select class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" v-model.lazy="tenant_version"  name="tenant_version" id="tenant_version">
                <option value="v1" selected>Version 1 (v1)</option>
            </select>
        </div>
        <div class="flex flex-col mb-2">
            <label class="text-xs text-gray-700 font-light" for="tenant_id">Application ID</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model.lazy="tenant_id" name="tenant_id" id="tenant_id">
        </div>
        <div class="flex flex-col mb-2">
            <label class="text-xs text-gray-700 font-light" for="tenant_key">API Key</label>
            <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" v-model.lazy="tenant_key" name="tenant_key" id="tenant_key">
        </div>
        <button @click="search" class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded w-full mt-4">
            Save
        </button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = defineProps(['editing', 'tenant'])

const name = ref('');
const tenant_version = ref('');
const tenant_id = ref('');
const tenant_key = ref('');

onMounted(async () => {
    if (props.editing) {
        name.value = props.tenant.name;
        tenant_version.value = props.tenant.tenant_version;
        tenant_id.value = props.tenant.tenant_id;
        tenant_key.value = props.tenant.tenant_key;
    }
});
</script>

<style scoped></style>